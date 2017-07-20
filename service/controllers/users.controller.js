import bcrypt from 'bcrypt';
import Bluebird from 'bluebird';
import errorResponse, { serverErrorResponse } from '../utils/error-response';
import Joi from 'joi';
import log from '../logger';
import Users from '../data/users.table';

const signUpValidation = Joi.object().keys({
	userName: Joi
		.string()
		.regex(/^[0-9a-zA-Z][0-9a-zA-Z.-_]*[0-9a-zA-Z]$/)
		.min(3)
		.max(30)
		.required(),
	email: Joi.string().email().max(150).required(),
	password: Joi
		.string()
		.regex(/(?=^[!@#$%\^&*()_\-+=\[{\]};:<>|\./?a-zA-Z\d]{7,}$)(?=([!@#$%\^&*()_\-+=\[{\]};:<>|\./?a-zA-Z\d]*\W+){1,})[!@#$%\^&*()_\-+=\[{\]};:<>|\./?a-zA-Z\d]*$/)
		.min(7)
		.max(30)
		.required(),
	displayName: Joi.string().max(100)
});

const ERR_USERNAME_TAKEN = 'user name taken';
const ERR_EMAIL_TAKEN = 'email taken';

export function signUp(req, res) {

	const validation = Joi.validate(req.body, signUpValidation);
	if (validation.error) {
		log.debug('Sign up request failed validation:', validation.error.details);
		return errorResponse(
			res,
			1000,
			'Bad request: Validation failed.',
			validation.error.details);
	}

	Bluebird.all([
			Users.query(req.body.userName).usingIndex('UserNameIndex').limit(1).execAsync(),
			Users.query(req.body.email).usingIndex('EmailIndex').limit(1).execAsync()
		])
		.spread((userNameTaken, emailTaken) => {
			if (userNameTaken.Items.length > 0) {
				throw 'user name taken';
			}

			if (emailTaken.Items.length > 0) {
				throw 'email taken';
			}
		}).then(() => {
			const salt = bcrypt.genSaltSync(10);
			const passwordHash = bcrypt.hashSync(req.body.password, salt);

			log.info('creating user:', {
				userName: req.body.userName,
				email: req.body.email
			});

			return Users
				.createAsync({
					userName: req.body.userName,
					displayName: req.body.displayName,
					email: req.body.email,
					passwordHash: passwordHash,
					role: 'user'
				})			
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
			if (err === ERR_USERNAME_TAKEN) {
				log.debug(
					'Sign up request was rejected because user name was taken:',
					req.body.userName);
				return errorResponse(
					res,
					1010,
					'User name already taken',
					'The user name you selected is already in use. Please select a unique user name or ' +
						'if you already have an account, try reseting your password.');
			}

			if (err === ERR_EMAIL_TAKEN) {
				log.debug(
					'Sign up request was rejected because the e-mail address was taken:',
					req.body.email);
				return errorResponse(
					res,
					1020,
					'E-mail address already taken',
					'The e-mail address you selected is already in use. Please select a unique address or ' +
						'if you already have an account, try reseting your password.');
			}

			log.error(
				'An unexpected error occured while attempting to create a user:',
				err);
			serverErrorResponse(res);
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
