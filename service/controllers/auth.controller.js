import _ from 'lodash';
import config from '../config';
import errorRespone, {
	badRequestResponse,
	forbiddenActionResponse,
	notAuthroizedResponse,
	resourceNotFoundResponse,
	serverErrorResponse
} from '../utils/error-response';
import Joi from 'joi';
import log from '../logger';
import mailSender from '../mail-sender';
import moment from 'moment';
import passport from 'passport';
import path from 'path';
import {
	doChangePassword,
	doRequestPasswordReset,
	getUserByName,
	getOAuthAccounts,
	removeOAuthConnection,
	sanitizeUserInfo
} from './helpers/users-helpers';
import queryString from 'query-string';
import url from 'url';

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

export function changePassword(req, res) {
	return doChangePassword(
		req.selectedUser,
		req.body.oldPassword,
		req.body.newPassword,
		req.user.role === 'admin')
		.then(() =>  {
			res.send('ok');
		})
		.catch(err => {
			if (err.name === 'BadPasswordError') {
				log.debug(
					`Attempt to change password for user "${req.selectedUser.userName}" failed because of a password mismatch.`);
				return notAuthroizedResponse(res);
			}

			if (err.name === 'WeakPasswordError') {
				log.debug(
					`Attempt to change password for user "${req.selectedUser.userName}" failed because the new password was too weak.`);
				return badRequestResponse(
					res,
					'New password did not meet strength requirements. It should contain upper- and lower-case letters, numbers, and symbols.');
			}

			log.error(
				`An error occurred while attempting to change password for user "${req.selectedUser.userName}":`,
				err);
			serverErrorResponse(res);
		});
}

export function requestPasswordReset(req, res) {
	if (!req.query.email) {
		return badRequestResponse(res, 'The "email" query parameter was missing but is required.');
	}

	const validation = Joi.validate(req.query.email, Joi.string().email());
	if (validation.error) {
		return badRequestResponse(res, 'The supplied e-mail address was invalid');
	}

	const userNotFound = 'user not found';
	doRequestPasswordReset(req.query.email)
		.then(user => {
			if (user === null) {
				throw userNotFound;
			}

			const resetUrl = url.resolve(config.baseUrl, '/confirmPasswordReset')
				+ '?'
				+ queryString.stringify({ user: user.userName, token: user.passwordResetToken });
			return mailSender(
				req.query.email,
				'Password reset request',
				path.resolve(__dirname, '../views/reset-email.pug'),
				{
					userName: user.displayName || user.userName,
					resetUrl: resetUrl,
					year: moment().year()
				});
		})
		.then(() => {
			res.send('ok');
		})
		.catch(err => {
			if (err === userNotFound) {
				return res.send('ok');
			}

			log.error(
				'An error occured while requesting a password reset:',
				err);
			serverErrorResponse(res);
		});
}

export function performPasswordReset(req, res) {
	res.json({ completed: false });
}

export function requireAccountAuthority(req, res, next) {
	if (req.user.userName === req.params.user) {
		req.selectedUser = JSON.parse(JSON.stringify(req.user));
		return next();
	}

	if (req.user.role !== 'admin') {
		return notAuthroizedResponse(res);
	}

	getUserByName(req.params.user)
		.then(u => {
			if (u === null) {
				return resourceNotFoundResponse(res);
			}

			req.selectedUser = u;
			next();
		})
		.catch(err => {
			log.error(
				`An error occurred while trying to retrieve data on user "${req.params.user}":`,
				err);
			serverErrorResponse(res);
		});
}
