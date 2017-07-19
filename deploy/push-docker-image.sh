#!/usr/bin/env bash
set -e

$(aws ecr get-login --region us-east-1)
docker tag divelog:$1 961445962603.dkr.ecr.us-east-1.amazonaws.com/divelog:$1
docker push 961445962603.dkr.ecr.us-east-1.amazonaws.com/divelog:$1
