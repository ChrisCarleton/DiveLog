import { getUserByName } from './helpers/users-helpers';
import Joi from 'joi';
import log from '../logger';
import {
	badRequestResponse,
	forbiddenActionResponse,
	notAuthroizedResponse,
	resourceNotFoundResponse,
	serverErrorResponse
} from '../utils/error-response';

import {
	doCreateLog,
	doDeleteLog,
	doGetLog,
	doListLogs,
	doUpdateLog
} from './helpers/dive-logs-helpers';

const listLogsQueryValidation = Joi.object().keys({
	limit: Joi.number().integer().positive().max(1000),
	order: Joi.string().valid(['asc', 'desc']).insensitive(),
	before: Joi.string().isoDate(),
	after: Joi.string().isoDate()
}).nand('before', 'after');

export function listLogs(req, res) {
	const validation = Joi.validate(req.query, listLogsQueryValidation);
	if (validation.error) {
		return badRequestResponse(res, validation.error.details);
	}

	doListLogs(req.logOwner.userId, req.query)
		.then(result => {
			res.status(200).json(result);
		})
		.catch(err => {
			log.error('An error occured while trying to list dive log entries:', err);
			serverErrorResponse(res);
		});
}

export function createLog(req, res) {
	doCreateLog(req.logOwner, req.body)
		.then(result => {
			res.status(200).json(result);
		})
		.catch(err => {
			if (err.name === 'ValidationError') {
				log.debug('Validation failed on creation of new log entry:', err.details);
				return badRequestResponse(res, err.details);
			}

			if (err.name === 'ForbiddenActionError') {
				log.warn(
					'An attempt was made at a forbidden action. User:',
					req.user.userName,
					'Details:',
					err.message);
				return forbiddenActionResponse(res, err.message);
			}

			log.error('An error occured while trying to create a dive log entry:', err);
			serverErrorResponse(res);
		});
}

export function viewLog(req, res) {
	res.json(req.logEntry);
}

export function editLog(req, res) {
	doUpdateLog(req.logOwner, req.logEntry.logId, req.body)
		.then(result => {
			res.json(result);
		})
		.catch(err => {
			if (err.name === 'ValidationError') {
				log.debug('Validation failed while updating dive log entry:', err.details);
				return badRequestResponse(res, err.details);
			}

			if (err.name === 'ForbiddenActionError') {
				log.warn(
					'An attempt was made at a forbidden action. User:',
					req.user.userName,
					'Details:',
					err.message);
				return forbiddenActionResponse(res, err.message);
			}

			log.error('An error occured while attempting to update a dive log entry:', err);
			serverErrorResponse(res);
		});
}

export function deleteLog(req, res) {
	doDeleteLog(req.logEntry.logId)
		.then(() => {
			log.debug('Log entry deleted:', req.logEntry.logId);
			res.json({ status: 'ok' });
		})
		.catch(err => {
			log.error('An error occurred while attempting to delete a log entry:', err);
			serverErrorResponse(res);
		});
}

export function ensureReadPermission(req, res, next) {
	if (!req.user) {
		return notAuthroizedResponse(res);
	}

	if (req.user.role === 'admin') {
		return next();
	}

	if (req.user.userId !== req.logOwner.userId) {
		return notAuthroizedResponse(res);
	}

	next();
}

export function ensureEditPermission(req, res, next) {
	if (!req.user) {
		return notAuthroizedResponse(res);
	}

	if (req.user.role === 'admin') {
		return next();
	}

	if (req.user.userId !== req.logOwner.userId) {
		return notAuthroizedResponse(res);
	}

	next();
}

export function getLogBookOwner(req, res, next) {
	getUserByName(req.params['user'])
		.then(user => {
			if (!user) {
				return resourceNotFoundResponse(res);
			}

			req.logOwner = user;
			next();
		})
		.catch(err => {
			log.error('An error occurred while trying to fetch the owner of a log entry:', err);
			serverErrorResponse(res);
		});
}

export function getLogInfo(req, res, next) {
	doGetLog(req.params['logId'])
		.then(entry => {
			if (!entry) {
				return resourceNotFoundResponse(res);
			}

			req.logEntry = entry;
			next();
		})
		.catch(err => {
			log.error('An error occurred while trying to fetch a dive log entry:', err);
			serverErrorResponse(res);
		});
}
