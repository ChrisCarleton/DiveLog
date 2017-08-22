import { sanitizeUserInfo } from './controllers/helpers/users-helpers';

export default function(req) {
	return {
		UserStore: {
			currentUser: req.user ? sanitizeUserInfo(req.user) : undefined
		}
	};
}
