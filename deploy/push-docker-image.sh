#!/usr/bin/env bash
set -e

$(aws ecr get-login --region us-east-1)
docker tag divelog:latest 961445962603.dkr.ecr.us-east-1.amazonaws.com/divelog:latest
docker push 961445962603.dkr.ecr.us-east-1.amazonaws.com/divelog:latest
