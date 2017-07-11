import Users from '../../data/users.table';

export function getUserByName(userName) {
	return Users
		.query(userName)
		.usingIndex('UserNameIndex')
		.limit(1)
		.execAsync()
		.then(res => {
			if (res.Items.length === 0) {
				return null;
			}

			return res.Items[0];
		});
}

export function getUserByEmail(email) {
	return Users
		.query(email)
		.usingIndex('EmailIndex')
		.limit(1)
		.execAsync()
		.then(res => {
			if (res.Items.length === 0) {
				return null;
			}

			return res.Items[0];
		});
}
