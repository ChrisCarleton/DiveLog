import Bluebird from 'bluebird';
import DiveLogs, { schema as diveLogsSchema } from '../../data/dive-logs.table';
import { ForbiddenActionError, ValidationError } from '../../utils/exceptions';
import Joi from 'joi';

export function doCreateLog(owner, logInfo) {
	if (logInfo.logId) {
		return Bluebird.reject(
			new ForbiddenActionError('Field "logId" cannot be specified. It will be generated automatically.'));
	}

	if (logInfo.ownerId && logInfo.ownerId !== owner.userId) {
		return Bluebird.reject(
			new ForbiddenActionError('The owner of the log entry cannot be changed. Please omit the "ownerId" field.'));
	}

	const logEntry = Object.assign(
		{},
		logInfo,
		{ ownerId: owner.userId });

	return DiveLogs
		.createAsync(logEntry)
		.then(result => {
			return result.attrs;
		});
}

export function doDeleteLog(logId) {
	return DiveLogs.destroyAsync(logId);
}

export function doGetLog(logId) {
	return DiveLogs.getAsync(logId)
		.then(result => {
			if (result) {
				return result.attrs;
			}

			return null;
		});
}

export function doUpdateLog(owner, logId, logInfo) {

	if (logInfo.ownerId && logInfo.ownerId !== owner.userId) {
		return Bluebird.reject(
			new ForbiddenActionError(
				'The owner of the log entry cannot be changed. Please omit the "ownerId" field from the data.'));
	}

	if (logInfo.logId && logInfo.logId !== logId) {
		return Bluebird.reject(
			new ForbiddenActionError(
				'The log entry ID is fixed and cannot be changed. Please omit the "logId" field from the data.'));
	}

	const validation = Joi.validate(logInfo, diveLogsSchema);
	if (validation.error) {
		return Bluebird.reject(
			new ValidationError(
				'Could not update log entry. Validation failed.',
				validation.error.details));
	}

	logInfo.logId = logId,
	logInfo.ownerId = owner.userId;
	delete logInfo['createdAt'];
	delete logInfo['updatedAt'];

	return DiveLogs.updateAsync(logInfo)
		.then(result => {
			if (!result) return null;

			return result.attrs;
		});
}
