#!/usr/bin/env bash
set -e

jqFilter='.Parameters.DockerImage="961445962603.dkr.ecr.us-east-1.amazonaws.com/divelog:'$1'"'

git checkout staging
git merge master
cat deploy/cf/staging.config.json | jq $jqFilter | tee deploy/cf/staging.config.json
git add deploy/cf/staging.config.json
git commit -m "Updating Docker image ID to Build #$1"
git push
