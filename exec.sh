#!/usr/bin/env bash
docker build -t market-signal-calling-an-api .
docker run --init -p 3000:3000 -p 3001:3001 -it market-signal-calling-an-api