import errorRespone, { serverErrorResponse } from '../utils/error-response';
import log from '../logger';
import passport from 'passport';

export function login(req, res) {
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			log.error('An error occured while attempting to log in a user:', err);
			return serverErrorResponse(res);
		}

		if (user) {
			return req.login(user, loginErr => {
				if (loginErr) {
					log.error('An error occured while attempting to log in a user:', loginErr);
					return serverErrorResponse(res);
				}

				res.json(user);
			});
		}

		return errorRespone(
			res,
			3000,
			'Authentication failed',
			'The user could not be authenticated. Either the user name or password (or both) is incorrect.'
			401);
	})(req, res);
}

export function logout(req, res) {
	req.logout();
	res.send('ok');
}

export function googleLogin() {

}

export function googleCallback() {

}

export function githubLogin() {

}

export function githubCallback() {

}

// Proceed if a user is currently signed in;
// otherwise, return a 401 Not Authorized error.
export function requireUser(req, res, next) {
	if (req.user) {
		return next();
	}

	res.status(401).json({});
}
