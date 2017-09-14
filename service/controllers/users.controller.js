import bcrypt from 'bcrypt';
import Bluebird from 'bluebird';
import Joi from 'joi';
import log from '../logger';
import passwordStrengthRegex from '../utils/password-strength-regex';
import Users from '../data/users.table';

import errorResponse, {
	badRequestResponse,
	forbiddenActionResponse,
	notAuthroizedResponse,
	resourceNotFoundResponse,
	serverErrorResponse
} from '../utils/error-response';

import {
	doUpdateProfile,
	getUserByEmail,
	getUserByName,
	getUsersAutoComplete,
	sanitizeUserInfo
} from './helpers/users-helpers';

const signUpValidation = Joi.object().keys({
	userName: Joi
		.string()
		.regex(/^[0-9a-z][0-9a-z.-_]*[0-9a-z]$/i)
		.min(3)
		.max(30)
		.required(),
	email: Joi.string().email().max(150).required(),
	password: Joi
		.string()
		.regex(passwordStrengthRegex)
		.min(7)
		.max(30)
		.required(),
	displayName: Joi.string().max(100)
});

const updateProfileValidation = Joi.object().keys({
	displayName: Joi.string().max(100).allow(null),
	email: Joi.string().email().max(150).allow(null),
	location: Joi.string().max(150).allow(null),
	dateOfBirth: Joi.string().isoDate().allow(null),
	certificationAgencies: Joi.string().max(150).allow(null),
	diverType: Joi.string().valid([
		null,
		'novice',
		'vacation',
		'typical',
		'advanced',
		'tech',
		'commercial',
		'divemaster',
		'instructor']),
	numberOfDives: Joi.string().valid([
		null,
		'unknown',
		'no logs',
		'0',
		'<20',
		'<50',
		'<100',
		'<500',
		'<1000',
		'<5000',
		'<9000',
		'9000+'])
}).required();

const listUsersValidation = Joi.object().keys({
	limit: Joi.number().integer().positive().max(1000),
	order: Joi.string().valid(['asc', 'desc']).insensitive()
});

const ERR_USERNAME_TAKEN = 'user name taken';
const ERR_EMAIL_TAKEN = 'email taken';

export function signUp(req, res) {

	const validation = Joi.validate(req.body, signUpValidation);
	if (validation.error) {
		log.debug('Sign up request failed validation:', validation.error.details);
		return badRequestResponse(
			res,
			validation.error.details);
	}

	Bluebird.all([
		getUserByName(req.body.userName),
		getUserByEmail(req.body.email)])
		.spread((userNameTaken, emailTaken) => {
			if (userNameTaken) {
				throw 'user name taken';
			}

			if (emailTaken) {
				throw 'email taken';
			}

			const salt = bcrypt.genSaltSync(10);
			const passwordHash = bcrypt.hashSync(req.body.password, salt);

			log.info('creating user:', {
				userName: req.body.userName,
				email: req.body.email
			});

			return Users
				.createAsync({
					userName: req.body.userName.toLowerCase(),
					displayName: req.body.displayName || req.body.userName,
					email: req.body.email.toLowerCase(),
					displayEmail: req.body.email,
					passwordHash: passwordHash,
					role: 'user'
				});
		})
		.then(result => {
			const user = result.attrs;

			req.login(user, loginError => {
				if (loginError) {
					log.error(
						'Failed to log in new user:',
						result.get('userId'),
						'Error:',
						loginError);
					return serverErrorResponse(res);
				}

				res.json(sanitizeUserInfo(user));
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

export function autoCompleteUsers(req, res) {
	const validation = Joi.validate(req.query.search, Joi.string().min(2));
	if (validation.error) {
		return badRequestResponse(res, validation.error.details);
	}

	getUsersAutoComplete(req.query.search)
		.then(results => {
			res.json(results);
		})
		.catch(err => {
			log.error('An error occurred while doing a user auto-complete look-up:', err);
			serverErrorResponse(res);
		});
}

export function listUsers(req, res, next) {
	if (req.query.search) {
		return next();
	}

	const validation = Joi.validate(req.query, listUsersValidation);
	if (validation.error) {
		return badRequestResponse(res, validation.error.details);
	}

	res.send('ok');
}

export function me(req, res) {
	res.json(sanitizeUserInfo(req.user));
}

export function getProfile(req, res) {
	res.json(sanitizeUserInfo(req.profileOwner));
}

export function updateProfile(req, res) {
	if (req.body.email === null) {
		return forbiddenActionResponse(
			res,
			'E-mail address cannot be deleted from a user\'s profile.');
	}

	const validation = Joi.validate(req.body, updateProfileValidation);
	if (validation.error) {
		log.debug('Update profile request failed validation:', validation.error.details);
		return badRequestResponse(
			res,
			validation.error.details);
	}

	doUpdateProfile(req.profileOwner, req.body)
		.then(profile => {
			res.json(sanitizeUserInfo(profile));
		})
		.catch(err => {
			if (err.name === 'EmailInUseError') {
				return forbiddenActionResponse(
					res,
					'Unable to change e-mail address. Address is already taken by another user!');
			}

			log.error('An error occurred while attempting to update a user\'s profile:', err);
			serverErrorResponse(res);
		});
}

export function getProfileOwner(req, res, next) {
	getUserByName(req.params['user'])
		.then(user => {
			if (!user) {
				return resourceNotFoundResponse(res);
			}

			req.profileOwner = user;
			next();
		})
		.catch(err => {
			log.error('An error occurred while trying to fetch the owner of a user profile', err);
			serverErrorResponse(res);
		});
}

export function requireProfileAuthority(req, res, next) {
	if (req.params.user === req.user.userName) {
		return next();
	}

	if (req.user.role === 'admin') {
		return next();
	}

	notAuthroizedResponse(res);
}

export function requireProfileView(req, res, next) {
	if (req.params.user === req.user.userName) {
		return next();
	}

	if (req.user.role === 'admin') {
		return next();
	}

	notAuthroizedResponse(res);
}
