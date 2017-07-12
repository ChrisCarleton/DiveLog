import Bluebird from 'bluebird';
import DiveLogs from '../../data/dive-logs.table';
import { ForbiddenActionError } from '../../utils/exceptions';

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

export function doGetLog(logId) {
	return DiveLogs.getAsync(logId)
		.then(result => {
			if (result) {
				return result.attrs;
			}

			return null;
		});
}
