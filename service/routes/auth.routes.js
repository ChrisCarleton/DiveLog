import {
	ensureOAuthAccountAccess,
	listOAuthAccounts,
	login,
	logout,
} from '../controllers/auth.controller';

module.exports = function(app) {
	const baseRoute = '/api/auth/';
	const baseUserRoute = '/api/auth/:user/';

	app.post(baseRoute + 'login/', login);
	app.post(baseRoute + 'logout/', logout);

	app.get(baseUserRoute + 'oauth/', ensureOAuthAccountAccess, listOAuthAccounts);
};
