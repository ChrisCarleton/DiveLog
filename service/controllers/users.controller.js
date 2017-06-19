import bcrypt from 'bcrypt';
import log from '../logger';
import Users from '../data/users.table';

export function signUp(req, res) {
	
	const salt = bcrypt.genSaltSync(10);
	const passwordHash = bcrypt.hashSync(req.body.password, salt);

	log.info('creating user:', {
		userName: req.body.userName,
		email: req.body.email
	});

	Users
		.createAsync({
			userName: req.body.userName,
			displayName: req.body.displayName,
			email: req.body.email,
			passwordHash: passwordHash,
			role: 'user'
		})
		.then(result => {
			const user = {
				userId: result.get('userId'),
				userName: result.get('userName'),
				email: result.get('email'),
				displayName: result.get('displayName'),
				role: result.get('role'),
				createdAt: result.get('createdAt')
			};

			req.login(user, loginError => {
				if (loginError) {
					log.error(
						'Failed to log in new user:',
						result.get('userId'),
						'Error:',
						loginError);
					return res.status(500).json({});	// TODO: Return a valid error.
				}

				res.json(user);	
			});
		})
		.catch(err => {
			log.error(err);
			res.status(400).json(err);
		});
}

export function me(req, res) {
	res.json(req.user);
}

export function searchUsers() {

}

export function profile() {

}

export function changePassword() {

}

export function resetPassword() {

}
