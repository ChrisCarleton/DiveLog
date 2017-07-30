import passport from 'passport';

module.exports = function(app) {
	app.get(
		'/auth/google',
		passport.authenticate('google', {scope: 'openid profile email'}));
	app.get(
		'/auth/google/callback',
		passport.authenticate('google', {failureRedirect: '/login'}),
		(req, res) => {
			res.redirect('/');
		});

	app.get(
		'/auth/github',
		passport.authenticate('github'));
	app.get(
		'/auth/github/callback',
		passport.authenticate('github', {failureRedirect: '/login'}),
		(req, res) => {
			res.redirect('/');
		});

	app.get(
		'/auth/facebook',
		passport.authenticate('facebook'));
	app.get(
		'/auth/facebook/callback',
		passport.authenticate('facebook', {failureRedirect: '/login'}),
		(req, res) => {
			res.redirect('/');
		});
};
