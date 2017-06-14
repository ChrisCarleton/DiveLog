let server;

before(() => {
	server = require('../service/server').server;
});

after(() => {
	server.close();
});
