import config from './config';
import passport from 'passport';
import url from 'url';

import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as GithubStrategy } from 'passport-github';

export default function(app) {
	passport.use(
		new LocalStrategy(
			(username, password, done) => {
				// Fetch user.

				return done();
			}));

	passport.use(
		new GoogleStrategy(
			{
				consumerKey: config.auth.google.consumerId,
				consumerSecret: config.auth.google.consumerSecret,
				callbackURL: url.resolve(config.baseUrl, '/api/1.0/auth/google/callback')
			},
			(token, tokenSecret, profile, done) => {
				done();
			}));

	passport.use(
		new GithubStrategy(
			{
				clientID: config.auth.github.clientId,
				clientSecret: config.auth.github.clientSecret,
				callbackURL: url.resolve(config.baseUrl, '/api/1.0/auth/github/callback')
			},
			(accessToken, refreshToken, profile, done) => {
				return done();
			}));

	passport.serializeUser((user, done) => {
		done();
	});

	passport.deserializeUser((userId, done) => {
		done();
	});

	app.use(passport.initialize());
	app.use(passport.session());
}
