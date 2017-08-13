import errorRespone, { notAuthroizedResponse, serverErrorResponse } from '../utils/error-response';
import log from '../logger';
import passport from 'passport';
import { getOAuthAccounts } from './helpers/users-helpers';

export function login(req, res) {
	passport.authenticate('local', (err, user) => {
		if (err) {
			log.error('An error occured while attempting to log in a user:', err);
			return serverErrorResponse(res);
		}

		if (user) {
			log.trace('Attempting to log in user:', user.userName);
			return req.login(user, loginErr => {
				if (loginErr) {
					log.error('An error occured while attempting to log in a user:', loginErr);
					return serverErrorResponse(res);
				}

				log.info('User', user.userName, 'has been successfully authenticated.');
				res.json(user);
			});
		}

		return errorRespone(
			res,
			3000,
			'Authentication failed',
			'The user could not be authenticated. Either the user name or password (or both) is incorrect.',
			401);
	})(req, res);
}

export function listOAuthAccounts(req, res) {
	getOAuthAccounts(req.params.user)
		.then(accounts => {
			res.json(accounts);
		})
		.catch(err => {
			log.error(
				'An error occured while attempting to retrieve user\'s OAuth accounts:',
				err);
			serverErrorResponse(res);
		});
}

export function ensureOAuthAccountAccess(req, res, next) {
	if (!req.user) {
		return notAuthroizedResponse(res);
	}

	if (req.user.role === 'admin') {
		return next();
	}

	if (req.user.userName !== req.params.user) {
		return notAuthroizedResponse(res);
	}

	next();
}

export function logout(req, res) {
	req.logout();
	res.send('ok');
}

// Proceed if a user is currently signed in;
// otherwise, return a 401 Not Authorized error.
export function requireUser(req, res, next) {
	if (req.user) {
		return next();
	}

	notAuthroizedResponse(res);
}

export function requireAdminUser(req, res, next) {
	if (req.user && req.user.role === 'admin') {
		return next();
	}

	notAuthroizedResponse(res);
}
