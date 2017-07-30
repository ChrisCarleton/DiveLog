import bcrypt from 'bcrypt';
import config from './config';
import { getOrCreateOAuthAccount } from './controllers/helpers/users-helpers';
import log from './logger';
import passport from 'passport';
import url from 'url';
import Users from './data/users.table';

import { Strategy as LocalStrategy } from 'passport-local';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as GithubStrategy } from 'passport-github';
import { Strategy as FacebookStrategy } from 'passport-facebook';

export default function(app) {
	passport.use(
		new LocalStrategy(
			(username, password, done) => {
				Users
					.query(username)
					.usingIndex('UserNameIndex')
					.limit(1)
					.execAsync()
					.then(response => {
						if (response.Items.length === 0) {
							log.debug('Could not log in user "', username, '". User does not exist');
							return done(null, null);
						}

						const result = response.Items[0];
						const passwordHash = result.get('passwordHash');

						if (!passwordHash) {
							log.debug('Could not log in user "', username, '". This user has no password set.');
							return done(null, null);
						}

						if (!bcrypt.compareSync(password, passwordHash)) {
							log.debug('Could not log in user "', username, '". Password was invalid.');
							return done(null, null);
						}

						done(null, result.attrs);
					})
					.catch(done);
			}));

	passport.use(
		new GoogleStrategy(
			{
				clientID: config.auth.google.consumerId,
				clientSecret: config.auth.google.consumerSecret,
				callbackURL: url.resolve(config.baseUrl, '/auth/google/callback')
			},
			(accessToken, refreshToken, profile, done) => {
				getOrCreateOAuthAccount(profile)
					.then(user => {
						done(null, user);
					})
					.catch(done);
			}));

	passport.use(
		new GithubStrategy(
			{
				clientID: config.auth.github.clientId,
				clientSecret: config.auth.github.clientSecret,
				callbackURL: url.resolve(config.baseUrl, '/auth/github/callback'),
				scope: ['user:email']
			},
			(accessToken, refreshToken, profile, done) => {
				if (!profile) return done(null, null);

				// We need to do some transformation on the profile object here because the
				// GitHub strategy does not present the profile using the schema prescribed
				// in the Passport documentation.
				if (!profile.displayName) profile.displayName = profile.username;
				if (profile.photos && profile.photos.length > 0) {
					profile.imageUrl = profile.photos[0].value;
				}

				getOrCreateOAuthAccount(profile)
					.then(user => {
						done(null, user);
					})
					.catch(done);
			}));

	passport.use(
		new FacebookStrategy(
			{
				clientID: config.auth.facebook.clientId,
				clientSecret: config.auth.facebook.clientSecret,
				callbackURL: url.resolve(config.baseUrl, '/auth/facebook/callback')
			},
			(accessToken, refreshToken, profile, done) => {
				getOrCreateOAuthAccount(profile)
					.then(user => {
						done(null, user);
					})
					.catch(done);
			}));

	passport.serializeUser((user, done) => {
		log.trace('Serializing user:', user);
		done(null, user.userId);
	});

	passport.deserializeUser((userId, done) => {
		log.trace('Deserializing session user:', userId);
		Users.getAsync(userId)
			.then(result => {
				if (!result) {
					return done(null, null);
				}

				const user = {
					userId: result.get('userId'),
					userName: result.get('userName'),
					email: result.get('email'),
					displayName: result.get('displayName'),
					role: result.get('role'),
					createdAt: result.get('createdAt')
				};

				done(null, user);
			})
			.catch(done);
	});

	app.use(passport.initialize());
	app.use(passport.session());
}
