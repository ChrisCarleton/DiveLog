# DiveLog

Circle CI build: [![CircleCI](https://circleci.com/gh/ChrisCarleton/DiveLog.svg?style=svg)](https://circleci.com/gh/ChrisCarleton/DiveLog)

Code Coverage: [![Coverage Status](https://coveralls.io/repos/github/ChrisCarleton/DiveLog/badge.svg?branch=master)](https://coveralls.io/github/ChrisCarleton/DiveLog?branch=master)

An online scuba diving log book.

## Building and Testing Locally

### Prerequisites

* You must have Node.js v6.11 or higher installed.
* You must have Docker installed to run the fake DynamoDb module.
* You must have Gulp installed globally. (Run `npm i -g gulp`.)
* It's also a good idea to have Bunyan installed globally for viewing log output. (`npm i -g bunyan`.)

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

#### Run unit tests:

``` gulp test ```

#### Lint the code:

``` gulp lint ```

#### Bundle the web components (WebPack):

``` gulp bundle ```

#### Run the dev server (see below for more information):

``` gulp dev-server ```

This is also aliased by the default task in `gulpfile.babel.js` so you can, optionally, just run

``` gulp ```

### Dev Server

To facilitate local development you can run the app in the dev server, which is powered by gulp-live-server. Gulp will monitor all .js and .pug files in the `service/` directory and
restart the server upon any changes so that you can continue making changes and the server
will keep the running app current.

The dev server uses a locally-running, in-memory version of DynamoDb for its data store. You
will need to make sure it's running before starting the dev server. See the section above on
Preparing a Dev Environment.

Additionally, Webpack Dev Server is used to serve the front end Javascript to the browser. This
gives us React hot reloading of modules which means the server should not need to be restarted
to immediately show front-end changes in the browser.

To start the dev server you can run

``` npm run dev ```
