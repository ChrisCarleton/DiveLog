#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker rm -f dynamodb
docker run -d -p 7777:7777 --name dynamodb tray/dynamodb-local -inMemory -port 7777
