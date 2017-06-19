# DiveLog

Circle CI build: [![CircleCI](https://circleci.com/gh/ChrisCarleton/DiveLog.svg?style=svg)](https://circleci.com/gh/ChrisCarleton/DiveLog)

Code Coverage: [![Coverage Status](https://coveralls.io/repos/github/ChrisCarleton/DiveLog/badge.svg?branch=master)](https://coveralls.io/github/ChrisCarleton/DiveLog?branch=master)

An online scuba diving log book

## Building and Testing Locally

### Prerequisites

* You must have Node.js v6.11 or higher installed.
* You must have Docker installed to run the fake DynamoDb module.
* You must have Gulp installed globally. (Run `npm i -g gulp`.)

### Preparing a Development Environment

From the project directory simply run: 

``` ./deploy/setup-local.sh ```

This will run the fake DynamoDb Docker image and provision it with the tables necessary for
testing and development. Now the project's integration tests will run and you can begin
developing locally.

### Tearing Down a Development Environment

To stop and remove the previously created Docker containers run

``` ./deploy/teardown-local.sh ```

### Common Gulp Tasks

Run unit tests:

``` gulp test ```

Lint the code:

``` gulp lint ```
