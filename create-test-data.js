import _ from 'lodash';
import bcrypt from 'bcrypt';
import Bluebird from 'bluebird';
import DiveLogs from './service/data/dive-logs.table';
import faker from 'faker';
import fs from 'fs';
import generator from './tests/generator';
import Users from './service/data/users.table';

Bluebird.promisifyAll(fs);

module.exports = gulpUtil => {
	const adminHash = bcrypt.hashSync('adm!n', bcrypt.genSaltSync(10));

	const adminUser = {
		userName: 'testadmin',
		email: 'test-admin@bottomtime.ca',
		displayEmail: 'Test-Admin@bottomtime.ca',
		displayName: 'Test Administrator',
		role: 'admin',
		passwordHash: adminHash
	};

	const users = [];
	for (let i = 0; i < 6; i++) {
		users.push(generator.generateUser('divelogs'));
	}

	gulpUtil.log(' * creating 6 users...');

	return Users.createAsync(adminUser)
		.then(() => {
			return Users.createAsync(users);
		})
		.then(result => {
			const recordCount = faker.random.number({min: 900, max: 1300});
			const userIds = _.map(result, u => { return u.get('userId'); });
			const diveLogs = [];

			gulpUtil.log(' * creating', recordCount, 'dive log entries...');
			for (let i = 0; i < recordCount; i++) {
				diveLogs.push(generator.generateDiveLogEntry(userIds));
			}

			return DiveLogs.createAsync(diveLogs);
		})
		.then(() => {
			const fileName = './logs/test-users';
			gulpUtil.log(' * writing user information to', gulpUtil.colors.yellow(fileName));
			return fs.writeFileAsync(
				fileName,
				JSON.stringify(users, null, ' '),
				'utf8');
		})
		.then(() => {
			return _.map(users, u => { return u.userName; });
		});
};
