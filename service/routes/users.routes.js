import {
	me,
	signUp,
	updateProfile
} from '../controllers/users.controller';
import { requireUser } from '../controllers/auth.controller';

module.exports = function(app) {
	const meBaseRoute = '/api/user/';
	const usersBaseRoute = '/api/users/';
	const userBaseRoute = usersBaseRoute + ':user/';

	app.get(meBaseRoute, requireUser, me);
	app.post(usersBaseRoute, signUp);

	app.route(userBaseRoute)
		.put(updateProfile);
};
