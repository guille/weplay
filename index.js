'use strict';

const uuid = require('node-uuid').v4();
const logger = require('weplay-common').logger('weplay-io');

var sio = require('socket.io');
var forwarded = require('forwarded-for');

process.title = 'weplay-io';

const port = process.env.WEPLAY_PORT || 3001;
const io = module.exports = sio(port);

const throttle = process.env.WEPLAY_THROTTLE || 100;

// redis socket.io adapter
const uri = process.env.WEPLAY_REDIS || 'redis://localhost:6379';

io.adapter(require('socket.io-redis')(uri));

// redis queries instance
const redis = require('weplay-common').redis();
const sub = require('weplay-common').redis();


logger.info('io listening', {port: port, uuid: uuid, adapter: uri});


const keys = {
    right: 0,
    left: 1,
    up: 2,
    down: 3,
    a: 4,
    b: 5,
    select: 6,
    start: 7
};


io.total = 0;
io.on('connection', socket => {
    const req = socket.request;
    const ip = forwarded(req, req.headers);
    const clientId = socket.id;
    var clientNick;
    var defaultHash;
    var currentHash;
    // keep track of connected clients
    updateCount(++io.total);

    redis.get('weplay:rom:default', (err, _defaultHash) => {
        defaultHash = _defaultHash;
        currentHash = _defaultHash.toString();
        logger.info('joining', currentHash);
        socket.join(currentHash);
    });

    socket.on('disconnect', () => {
        updateCount(--io.total);
        logger.info('disconnect', {nick: clientNick, id: socket.id, ip: ip});
        broadcast(socket, 'disconnected', clientNick);
        clientNick = undefined;
    });

    // send events log so far
    redis.lrange('weplay:log', 0, 20, (err, log) => {
        if (!Array.isArray(log)) return;
        log.reverse().forEach(data => {
            data = data.toString();
            const args = JSON.parse(data);
            //logger.debug('log', {args: args});
            if (Array.isArray(args)) {
                socket.emit(...args);
            } else {
                logger.error(data);
            }
        });
    });

    // broadcast moves, throttling them first
    socket.on('move', key => {
        if (null == keys[key]) return;
        redis.get(`weplay:move-last:${clientId}`, (err, last) => {
            if (last) {
                last = last.toString();
                if (Date.now() - last < throttle) {
                    return;
                }
            }
            logger.info('weplay:move', {key: keys[key], move: key, socket: {nick: socket.nick, id: socket.id}, ip: ip});
            redis.set(`weplay:move-last:${clientId}`, Date.now());
            redis.expire(`weplay:move-last:${clientId}`, 1);
            redis.publish(`weplay:move:${currentHash}`, keys[key]);
            //socket.emit('move', key, socket.nick);
            broadcast(socket, 'move', key, socket.nick);
        });
    });

    socket.on('command', command => {
        if (null == command) return;
        redis.get(`weplay:command-last:${clientId}`, (err, last) => {
            if (last) {
                last = last.toString();
                if (Date.now() - last < throttle) {
                    return;
                }
            }
            logger.info('weplay:command', {command: command, socket: {nick: socket.nick, id: socket.id}, ip: ip});
            redis.set(`weplay:command-last:${clientId}`, Date.now());
            redis.expire(`weplay:command-last:${clientId}`, 1);
            var game = command.split('#')[1];
            redis.get(`weplay:rom:${game}`, (err, hash) => {
                if (hash) {
                    if (currentHash)socket.leave(currentHash);
                    currentHash = hash.toString();
                    logger.debug('weplay:command joining', currentHash);
                    socket.join(currentHash);
                }
            });
        });
    });


    // send chat mesages
    socket.on('message', msg => {
        logger.info('message', {msg: msg, socket: {nick: socket.nick, id: socket.id}, ip: ip});
        broadcast(socket, 'message', msg, socket.nick);
    });

    // broadcast user joining
    socket.on('join', nick => {
        if (clientNick) return;
        socket.nick = nick;
        clientNick = nick;
        logger.info('join', {nick: socket.nick, id: socket.id, ip: ip});
        //logger.debug('joined', {socket: {nick: socket.nick, id: socket.id}});
        broadcast(socket, 'join', socket.nick);
        // event done, notify client
        socket.emit('joined');
    });


    function broadcast(socket/*, …*/) {
        const args = Array.prototype.slice.call(arguments, 1);
        //logger.debug('broadcast', {room: currentHash, args: args});
        redis.lpush('weplay:log', JSON.stringify(args));
        redis.ltrim('weplay:log', 0, 20);
        io.to(currentHash).emit.apply(io.to(currentHash), args);
    }

});

// sends connections count to everyone
// by aggregating all servers
function updateCount(total) {
    redis.hset('weplay:connections', uuid, total);
}

// broadcast events and persist them to redis
