import {
	changePassword,
	ensureOAuthAccountAccess,
	listOAuthAccounts,
	login,
	logout,
	performPasswordReset,
	removeOAuthAccount,
	requestPasswordReset,
	requireAccountAuthority,
	requireUser
} from '../controllers/auth.controller';

module.exports = function(app) {
	const baseRoute = '/api/auth/';
	const baseUserRoute = '/api/auth/:user/';
	const resetPasswordRoute = baseRoute + 'resetPassword/';

	app.post(baseRoute + 'login/', login);
	app.post(baseRoute + 'logout/', logout);

	app.get(baseUserRoute + 'oauth/', ensureOAuthAccountAccess, listOAuthAccounts);
	app.delete(
		baseUserRoute + 'oauth/:provider/',
		ensureOAuthAccountAccess,
		removeOAuthAccount);

	app.post(baseUserRoute + 'password/', requireUser, requireAccountAuthority, changePassword);

	app.get(resetPasswordRoute, requestPasswordReset);
	app.post(resetPasswordRoute, performPasswordReset);

};
