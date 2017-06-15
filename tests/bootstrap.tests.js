import glob from 'glob';

let server;

before(done => {
	const database = require('../service/data/database');
	const tables = glob.sync('../service/data/**/*.table.js');
	tables.forEach(table => {
		require(table);
	});

	database.createTables(err => {
		if (err) {
			return done(err);
		}

		server = require('../service/server').server;
		done();
	});
});

after(() => {
	server.close();
});
