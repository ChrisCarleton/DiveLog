import log from '../logger';
import passport from 'passport';
import { requireUser } from '../controllers/auth.controller';

const authenticationSucceeded = (req, res) => {
	if (req.query && req.query.returnTo) {
		return res.redirect(req.query.returnTo);
	}

	if (req.user && req.accountConnected) {
		return res.redirect(`/profile/${req.user.userName}/oauth`);
	}

	res.redirect('/');
};

module.exports = function(app) {
	app.get(
		'/auth/google',
		passport.authenticate('google', {scope: 'openid profile email'}));
	app.get(
		'/auth/google/callback',
		passport.authenticate('google', {failureRedirect: '/login'}),
		authenticationSucceeded);
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
		authenticationSucceeded);
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
		authenticationSucceeded);
	app.get(
		'/auth/facebook/connect',
		requireUser,
		passport.authorize('facebook'));

	// Suppressing unused vars error here because we need the "next" parameter to indicate
	// to Express that this is an error handler:
	// eslint-disable-next-line no-unused-vars
	app.use('/auth', (err, req, res, next) => {
		log.error('An error occurred while attempting to authenticate a user via OAuth:', err);
		if (err.name === 'EmailInUseError') {
			return res.redirect('/error/emailInUse');
		}

		res.redirect('/error/server');
	});
};
