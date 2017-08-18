#!/usr/bin/env bash
set -e

mkdir phantom/
aws s3 cp s3://divelog-cloudformation-templates/phantomjs.tar.bz2 ./phantom
tar -xf phantom/phantomjs.tar.bz2 -C ./phantom
