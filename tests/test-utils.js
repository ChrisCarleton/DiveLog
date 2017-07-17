import _ from 'lodash';
import bcrypt from 'bcrypt';
import Bluebird from 'bluebird';
import Users from '../service/data/users.table';

export function purgeTable(table, hashKey, rangeKey) {
	return table
		.scan()
		.limit(500)
		.loadAll()
		.execAsync()
		.then(results => {
			const promises = _.map(results.Items, (result) => {
				const item = {};
				item[hashKey] = result.get(hashKey);

				if (rangeKey) {
					item[rangeKey] = result.get(rangeKey);
				}

				return table.destroyAsync(item);
			});

			return Bluebird.all(promises);
		});
}

export function createUser(userName, email, password, isAdmin) {
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);

	return Users
		.createAsync({
			userName: userName,
			email: email,
			passwordHash: hash,
			role: isAdmin ? 'admin' : 'user'
		})
		.then(result => {
			return result.attrs;
		});
}

