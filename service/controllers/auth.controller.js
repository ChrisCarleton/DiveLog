import _ from 'lodash';
import errorRespone, {
	badRequestResponse,
	forbiddenActionResponse,
	notAuthroizedResponse,
	resourceNotFoundResponse,
	serverErrorResponse
} from '../utils/error-response';
import log from '../logger';
import passport from 'passport';
import {
	getUserByName,
	getOAuthAccounts,
	removeOAuthConnection,
	sanitizeUserInfo
} from './helpers/users-helpers';

const KNOWN_OAUTH_PROVIDERS = ['google', 'facebook', 'github'];

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

				log.trace('User', user.userName, 'has been successfully authenticated.');
				res.json(sanitizeUserInfo(user));
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

export function removeOAuthAccount(req, res) {
	if (_.indexOf(KNOWN_OAUTH_PROVIDERS, req.params.provider) === -1) {
		return badRequestResponse(
			res,
			`"${req.params.provider}" is not a recognized OAuth provider.`);
	}

	getUserByName(req.params.user)
		.then(user => {
			if (!user) {
				// Profile owner doesn't exist.
				throw 'not found';
			}

			return removeOAuthConnection(user, req.params.provider);
		})
		.then(() => {
			res.send('ok');
		})
		.catch(err => {
			if (err === 'not found') {
				return resourceNotFoundResponse(res);
			}

			if (err.name === 'ForbiddenActionError') {
				return forbiddenActionResponse(
					res,
					'Users who do not have passwords set on their accounts must have at least one active OAuth provider.');
			}

			log.error('An error occurred while trying to remove an OAuth connection', err);
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
