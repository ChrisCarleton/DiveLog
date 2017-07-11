import { getUserByName } from './helpers/users-helpers';
import log from '../logger';
import { resourceNotFoundResponse, serverErrorResponse } from '../utils/error-response';

import {
	doCreateLog
} from './helpers/dive-logs-helpers';

export function listLogs() {

}

export function createLog(req, res) {
	doCreateLog(req.body)
		.then(result => {
			res.status(200).json(result);
		})
		.catch(err => {
			log.error('An error occured while trying to create a dive log entry:', err);
			serverErrorResponse(res);
		});
}

export function viewLog() {

}

export function editLog() {

}

export function deleteLog() {

}

export function ensureReadPermission() {

}

export function ensureEditPermission() {

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
			log.error('An error occurred while trying to fetch the owner of a log entry', err);
			serverErrorResponse(res);
		});
}

export function getLogInfo() {

}
