#!/bin/bash

BOTS=${1:-10}
MOVES=${2:-20}
TIME-${3:-30000}

echo spawning $BOTS bots, each doing $MOVES moves, connecting for $TIME ms

for i in `seq 1 $BOTS`;
do
    node clientbot.js $MOVES $TIME &
done

wait