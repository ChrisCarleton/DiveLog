import {
	login,
	logout,
// 	googleLogin,
// 	googleCallback,
// 	githubLogin,
// 	githubCallback,
// 	requireUser
} from '../controllers/auth.controller';

module.exports = function(app) {
	const baseRoute = '/api/auth/';

	app.post(baseRoute + 'login/', login);
	app.post(baseRoute + 'logout/', logout);
}
