#!/bin/sh
export GAS_DEBUG=1&&
./node_modules/.bin/webpack&&
cp .clasp.test.json .clasp.json&&
clasp push
export GAS_DEBUG=0