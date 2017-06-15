import log from '../logger';
import Users from '../data/users.table';

export function signUp(req, res) {
	const user = {};
	Users
		.createAsync(user)
		.then(() => {
			res.json(user);
		})
		.catch(err => {
			log.error(err);
			res.status(400).json(err);
		});

}

export function me() {

}

export function profile() {

}

export function changePassword() {

}

export function resetPassword() {

}
