#!/usr/bin/env bash
set -e

mkdir phantom-temp/
aws s3 cp s3://divelog-cloudformation-templates/phantomjs-2.1.1-linux-x86_64.tar.bz2 ./phantom-temp/phantomjs.tar.bz2
tar -xf phantom-temp/phantomjs.tar.bz2 -C /usr/bin
ln -s /usr/bin/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/bin/phantomjs
phantomjs -v

rm -rf phantom-temp/
