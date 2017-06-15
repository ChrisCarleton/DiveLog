import {
	signUp
} from '../controllers/users.controller';

module.exports = function(app) {
	const baseRoute = '/api/users/';

	app.post(baseRoute, signUp);
}
