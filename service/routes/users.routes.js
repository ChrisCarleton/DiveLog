import {
	changePassword,
	me,
	performPasswordReset,
	requestPasswordReset,
	requireAccountAuthority,
	signUp
} from '../controllers/users.controller';
import { requireUser } from '../controllers/auth.controller';

module.exports = function(app) {
	const meBaseRoute = '/api/user/';
	const usersBaseRoute = '/api/users/';
	const resetPasswordRoute = meBaseRoute + 'resetPassword/';

	app.get(meBaseRoute, requireUser, me);
	app.post(usersBaseRoute, signUp);

	app.post(usersBaseRoute + ':user/password', requireAccountAuthority, changePassword);
	app.get(resetPasswordRoute, requestPasswordReset);
	app.post(resetPasswordRoute, performPasswordReset);
};
