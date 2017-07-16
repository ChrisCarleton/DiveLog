import _ from 'lodash';
import Bluebird from 'bluebird';
import DiveLogs, { createSchema, updateSchema } from '../../data/dive-logs.table';
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

	logInfo.ownerId = owner.userId;
	const validation = Joi.validate(logInfo, createSchema);
	if (validation.error) {
		return Bluebird.reject(
			new ValidationError(
				'Could not create log entry. Validation failed.',
				validation.error.details));
	}

	return DiveLogs
		.createAsync(logInfo)
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

export function doListLogs(ownerId, options) {
	options = options || {};
	options.limit = options.limit || 100;
	options.order = options.order || 'desc';

	let baseQuery = DiveLogs
		.query(ownerId)
		.usingIndex('OwnerIndex')
		.limit(options.limit);

	baseQuery = (options.order === 'asc')
		? baseQuery.ascending()
		: baseQuery.descending();

	if (options.before) {
		baseQuery = baseQuery.where('entryTime').lt(options.before);
	}

	if (options.after) {
		baseQuery = baseQuery.where('entryTime').gt(options.after);
	}

	return baseQuery
		.execAsync()
		.then(result => {
			return _.map(result.Items, item => {
				return item.attrs;
			});
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

	const validation = Joi.validate(logInfo, updateSchema);
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
