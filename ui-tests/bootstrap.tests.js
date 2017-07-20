import test from 'selenium-webdriver/testing';

let server;

test.before(() => {
	server = require('../service/server').server;
});

test.after(() => {
	server.close();
});
