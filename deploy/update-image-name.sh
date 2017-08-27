#!/usr/bin/env bash
set -e

jqFilter='.Parameters.DockerImage="961445962603.dkr.ecr.us-east-1.amazonaws.com/divelog:'$1'"'

git checkout release
git merge master -m "Merging latest form master"
cat deploy/cf/staging.config.json | jq $jqFilter | tee deploy/cf/staging.config.json
cat deploy/cf/prod.us-east-1.config.json | jq $jqFilter | tee deploy/cf/prod.us-east-1.config.json
git add deploy/cf/staging.config.json
git add deploy/cf/prod.us-east-1.config.json
git commit -m "Updating Docker image ID to Build #$1"
git push
