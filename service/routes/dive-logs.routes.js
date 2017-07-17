import {
	createLog,
	deleteLog,
	editLog,
	ensureEditPermission,
	ensureReadPermission,
	getLogBookOwner,
	getLogInfo,
	listLogs,
	viewLog
} from '../controllers/dive-logs.controller';

module.exports = function(app) {
	const baseRoute = '/api/logs/:user/';
	const logRoute = baseRoute + ':logId/';

	app.use(baseRoute, getLogBookOwner);
	app.use(logRoute, getLogInfo);

	app.route(baseRoute)
		.get(ensureReadPermission, listLogs)
		.post(ensureEditPermission, createLog);

	app.route(logRoute)
		.get(ensureReadPermission, viewLog)
		.put(ensureEditPermission, editLog)
		.patch(ensureEditPermission, editLog)
		.delete(ensureEditPermission, deleteLog);
}
