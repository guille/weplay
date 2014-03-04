
# weplay

## How to install

Make sure `cairo` is installed, then run:

```bash
$ npm install
```

Then run it with the following ENV vars:

- `WEPLAY_ROM` - pointing to the rom you want to emulate
- `WEPLAY_PORT` - pointing to the port you want to listen on (`3000`)

```
$ node index
```

## How to use test bots

To run a single bot:

```
$ node clientbot.js <number_of_moves> <connection_time>
```
Number of moves (default 20) sets how many random moves the bot makes
Connection time (default 30000) sets how long the bot stays connected

To run many bots:
```
$ ./botspawner.sh <number_of_bots> <number_of_moves> <connection_time>
```

## Bandwith notes

A bot connected for 60 seconds receives around 1MB in frame
buffer data. Chat data consumption is pretty small, maybe a few KB.
A single frame weighs in at 2.7 KB.

On my mac:
10 simultaneous clients adds noticable (200-400 ms) lag to emulator rendering.
7 clients is better but still delayed.
3 clients is probably the highest you can go without noticing a difference (at least
on my not-so-good school internet)

## License

MIT
