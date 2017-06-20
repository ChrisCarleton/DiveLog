//import log from '../logger';

export function login() {

}

export function logout() {

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
