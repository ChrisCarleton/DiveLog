import { getUserByName } from './helpers/users-helpers';
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
	doGetLog
} from './helpers/dive-logs-helpers';

export function listLogs() {

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
					req.user,
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

export function editLog() {

}

export function deleteLog(req, res) {
	res.send('ok');
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
