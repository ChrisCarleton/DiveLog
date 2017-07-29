import Bluebird from 'bluebird';
import generator from '../generator';
import { getOrCreateOAuthAccount } from '../../service/controllers/helpers/users-helpers';
import { expect } from 'chai';
import OAuth from '../../service/data/oauth.table';
import { purgeTable } from '../test-utils';
import Users from '../../service/data/users.table';
import uuid from 'uuid/v4';

describe('Users helper methods', () => {

	const purgeTables = done => {
		Bluebird.all([
				purgeTable(Users, 'userId'),
				purgeTable(OAuth, 'providerId', 'provider')
			])
			.then(() => {
				done();
			})
			.catch(done);
	};

	after(purgeTables);
	beforeEach(purgeTables);

	describe('getOrCreateOAuthAccount method', () => {

		let profile;
		beforeEach(() => {
			profile = {
				id: uuid(),
				provider: 'facegram',
				displayName: 'David Smith',
				emails: [{ type: 'main', value: 'davey666@gmail.com' }]
			};
		});

		it('will create a brand new account', done => {
			getOrCreateOAuthAccount(profile)
				.then(user => {
					expect(user).to.exist;
					expect(user.userName).to.equal(profile.emails[0].value);
					expect(user.email).to.equal(profile.emails[0].value);
					expect(user.passwordHash).to.not.exist;
					expect(user.role).to.equal('user');
					expect(user.displayName).to.equal(profile.displayName);

					return Bluebird.all([
						Users.getAsync(user.userId),
						OAuth.getAsync(profile.id, profile.provider)]);
				})
				.spread((user, oauth) => {
					expect(user).to.exist;
					user = user.attrs;
					expect(user.userId).to.exist;
					expect(user.userName).to.equal(profile.emails[0].value);
					expect(user.email).to.equal(profile.emails[0].value);
					expect(user.passwordHash).to.not.exist;
					expect(user.role).to.equal('user');
					expect(user.displayName).to.equal(profile.displayName);


					expect(oauth).to.exist;
					oauth = oauth.attrs;
					expect(oauth.providerId).to.equal(profile.id);
					expect(oauth.provider).to.equal(profile.provider);
					expect(oauth.userId).to.equal(user.userId);
					expect(oauth.email).to.equal(profile.emails[0].value);

					done();
				})
				.catch(done);
		});

		it('will return an existing account', done => {
			const user = {
				userName: profile.emails[0].value,
				email: profile.emails[0].value,
				role: 'user',
				displayName: profile.displayName
			};

			Users.createAsync(user)
				.then(result => {
					expect(result).to.exist;
					user.userId = result.get('userId');
					user.createdAt = result.get('createdAt');

					return OAuth.createAsync({
						providerId: profile.id,
						provider: profile.provider,
						userId: user.userId,
						email: user.email
					});
				})
				.then(() => {
					return getOrCreateOAuthAccount(profile);
				})
				.then(userRec => {
					expect(userRec).to.exist;
					expect(userRec).to.eql(user);
					done();
				})
				.catch(done);
		});

		it('will fail if the profile email address is already registered', done => {
			const user = generator.generateUser();
			user.email = profile.emails[0].value;

			Users.createAsync(user)
				.then(() => {
					return getOrCreateOAuthAccount(profile);
				})
				.then(() => {
					done('should not have succeeded');
				})
				.catch(err => {
					expect(err.name).to.equal('EmailInUseError');
					done();
				});
		});

		it('will fail if the profile has no e-mail addresses', done => {
			profile.emails = [];

			getOrCreateOAuthAccount(profile)
				.then(() => {
					done('should not have succeeded');
				})
				.catch(err => {
					expect(err.name).to.equal('MissingEmailError');
					done();
				});
		});

		it('will self-correct if the oauth record exists but the matching user does not', done => {
			OAuth.createAsync({
					providerId: profile.id,
					provider: profile.provider,
					userId: uuid(),
					email: 'missing_user@weirdstates.com'
				})
				.then(() => {
					return getOrCreateOAuthAccount(profile);
				})
				.then(user => {
					expect(user).to.exist;
					expect(user.userName).to.equal(profile.emails[0].value);
					expect(user.email).to.equal(profile.emails[0].value);
					expect(user.passwordHash).to.not.exist;
					expect(user.role).to.equal('user');
					expect(user.displayName).to.equal(profile.displayName);

					return Bluebird.all([
						Users.getAsync(user.userId),
						OAuth.getAsync(profile.id, profile.provider)]);
				})
				.spread((user, oauth) => {
					expect(user).to.exist;
					user = user.attrs;
					expect(user.userId).to.exist;
					expect(user.userName).to.equal(profile.emails[0].value);
					expect(user.email).to.equal(profile.emails[0].value);
					expect(user.passwordHash).to.not.exist;
					expect(user.role).to.equal('user');
					expect(user.displayName).to.equal(profile.displayName);


					expect(oauth).to.exist;
					oauth = oauth.attrs;
					expect(oauth.providerId).to.equal(profile.id);
					expect(oauth.provider).to.equal(profile.provider);
					expect(oauth.userId).to.equal(user.userId);
					expect(oauth.email).to.equal(profile.emails[0].value);

					done();
				})
				.catch(done);
		});

	});

});
