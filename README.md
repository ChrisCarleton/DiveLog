# Bottom Time

Circle CI build: [![CircleCI](https://circleci.com/gh/ChrisCarleton/DiveLog.svg?style=svg)](https://circleci.com/gh/ChrisCarleton/DiveLog)

Code Coverage: [![Coverage Status](https://coveralls.io/repos/github/ChrisCarleton/DiveLog/badge.svg?branch=master)](https://coveralls.io/github/ChrisCarleton/DiveLog?branch=master)

Dependencies: [![dependencies Status](https://david-dm.org/ChrisCarleton/DiveLog/status.svg)](https://david-dm.org/ChrisCarleton/DiveLog)

Security: [![NSP Status](https://nodesecurity.io/orgs/chriscarleton/projects/fb6819e8-628b-4139-a228-1ed5b93d9ae7/badge)](https://nodesecurity.io/orgs/chriscarleton/projects/fb6819e8-628b-4139-a228-1ed5b93d9ae7)

An online scuba diving log book.

## Developing Against Bottom Time.

See the API documentation [here](./docs/api.md).

## Building and Testing Locally

### Prerequisites

* You must have Node.js v8.4.0 or higher installed.
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

### The Mail Client

Some functions of the application involve the sending of templated e-mails. In order for the app's
mail client to work, certain environment varialbes need to be set.

* `DIVELOG_MAIL_FROM_ADDRESS` - The address from which e-mail messages from the app will appear to originate from.
* `DIVELOG_MAIL_HOST` - The host name or URL of the SMTP server that will deliver the app's mail messages.
* `DIVELOG_MAIL_PORT` - The port number on which the SMTP host listens for connections.
* `DIVELOG_MAIL_USERNAME` - The username to use when authenticating with the SMTP server.
* `DIVELOG_MAIL_PASSWORD` - The password to use when authenticating with the SMTP server.

#### Testing the Mail Client

To test to see if the e-mail client is configured correctly, there is a test script that can be run.

```
node deploy/mail-test.js <destination>
```

The script will invoke the app's mail client to send a test e-mail to the address specified as `<destination>`.

### Common Gulp Tasks

#### Run unit tests:

``` gulp test ```

#### Lint the code:

``` gulp lint ```

#### Bundle the web components (WebPack):

``` gulp bundle ```

#### Run the dev server (see below for more information):

``` npm run dev ```

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

#### Generating Test Data

Run the following command

```
npm run test-data
```

To generate some random test data and inject it into the dev server database. You will get
several users (including one admin user) and roughly 1000 dive log entries.
