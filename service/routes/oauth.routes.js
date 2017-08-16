import { requireUser } from '../controllers/auth.controller';
import passport from 'passport';

const authorizationSucceeded = (req, res) => {
	if (!req.account) {
		// This is just a standard login. Redirect to home page.
		return res.redirect('/');
	}

	res.redirect(`/profile/${req.user.userName}/oauth`);
};

module.exports = function(app) {
	app.get(
		'/auth/google',
		passport.authenticate('google', {scope: 'openid profile email'}));
	app.get(
		'/auth/google/callback',
		passport.authenticate('google', {failureRedirect: '/login'}),
		authorizationSucceeded);
	app.get(
		'/auth/google/connect',
		requireUser,
		passport.authorize('google', {scope: 'openid profile email'}));

	app.get(
		'/auth/github',
		passport.authenticate('github'));
	app.get(
		'/auth/github/callback',
		passport.authenticate('github', {failureRedirect: '/login'}),
		authorizationSucceeded);
	app.get(
		'/auth/github/connect',
		requireUser,
		passport.authorize('github'));

	app.get(
		'/auth/facebook',
		passport.authenticate('facebook'));
	app.get(
		'/auth/facebook/callback',
		passport.authenticate('facebook', {failureRedirect: '/login'}),
		authorizationSucceeded);
	app.get(
		'/auth/facebook/connect',
		requireUser,
		passport.authorize('facebook'));
};
