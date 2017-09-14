import {
	autoCompleteUsers,
	getProfile,
	getProfileOwner,
	listUsers,
	me,
	requireProfileAuthority,
	requireProfileView,
	signUp,
	updateProfile
} from '../controllers/users.controller';
import { requireAdminUser, requireUser } from '../controllers/auth.controller';

module.exports = function(app) {
	const meBaseRoute = '/api/user/';
	const usersBaseRoute = '/api/users/';
	const userBaseRoute = usersBaseRoute + ':user/';

	app.get(meBaseRoute, requireUser, me);

	app.route(usersBaseRoute)
		.get(requireAdminUser, listUsers, autoCompleteUsers)
		.post(signUp);

	app.route(userBaseRoute)
		.get(requireUser, requireProfileView, getProfileOwner, getProfile)
		.patch(requireUser, requireProfileAuthority, getProfileOwner, updateProfile)
		.put(requireUser, requireProfileAuthority, getProfileOwner, updateProfile);
};
