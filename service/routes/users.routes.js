import {
	me,
	signUp
} from '../controllers/users.controller';
import { requireUser } from '../controllers/auth.controller';

module.exports = function(app) {
	const meBaseRoute = '/api/user/';
	const usersBaseRoute = '/api/users/';

	app.get(meBaseRoute, requireUser, me);
	app.post(usersBaseRoute, signUp);
}
