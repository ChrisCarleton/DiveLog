import _ from 'lodash';
import Bluebird from 'bluebird';
import generator from '../generator';
import { expect } from 'chai';
import OAuth from '../../service/data/oauth.table';
import { purgeTable } from '../test-utils';
import Users from '../../service/data/users.table';
import uuid from 'uuid/v4';

import {
	getOrCreateOAuthAccount,
	getOrConnectOAuthAccount,
	getOAuthAccounts,
	removeOAuthConnection
} from '../../service/controllers/helpers/users-helpers';

describe('Users helper methods', () => {

	const purgeTables = done => {
		Bluebird.all([
			purgeTable(Users, 'userId'),
			purgeTable(OAuth, 'providerId', 'provider') ])
			.then(() => {
				done();
			})
			.catch(done);
	};

	after(purgeTables);
	beforeEach(purgeTables);

	describe('getOAuthAccounts method', () => {

		let profile;
		beforeEach(done => {
			profile = generator.generateUser();
			Users.createAsync(profile)
				.then(result => {
					profile.userId = result.get('userId');
					done();
				})
				.catch(done);
		});

		it('returns a collection of connected OAuth providers', done => {
			const oauth = [
				{
					providerId: uuid(),
					provider: 'InstaBook',
					userId: profile.userId,
					email: profile.email
				},
				{
					providerId: uuid(),
					provider: 'Facegram',
					userId: profile.userId,
					email: profile.email
				}
			];

			OAuth.createAsync(oauth)
				.then(() => {
					return getOAuthAccounts(profile.userName);
				})
				.then(result => {
					expect(result).to.exist;

					const expected = _.map(oauth, oa => {
						return oa.provider;
					});
					const difference = _.difference(result, expected);

					expect(difference).to.empty;
					done();
				})
				.catch(done);
		});

		it('will return an empty array if no connections exist', done => {
			getOAuthAccounts(profile.userName)
				.then(result => {
					expect(result).to.be.an('array');
					expect(result).to.be.empty;
					done();
				})
				.catch(done);
		});

		it('will return an empty array if the user name does not exist', done => {
			getOAuthAccounts('MadeUpUserName')
				.then(result => {
					expect(result).to.be.an('array');
					expect(result).to.be.empty;
					done();
				})
				.catch(done);
		});

	});

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
					expect(user.userName).to.match(/^[a-z0-9]{12}$/i);
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
					expect(user.userName).to.match(/^[a-z0-9]{12}$/i);
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
				email: 'missing_user@weirdstates.com' })
				.then(() => {
					return getOrCreateOAuthAccount(profile);
				})
				.then(user => {
					expect(user).to.exist;
					expect(user.userName).to.match(/^[a-z0-9]{12}$/i);
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
					expect(user.userName).to.match(/^[a-z0-9]{12}$/i);
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

	describe('getOrConnectOAuthAccount method', () => {

		it('will return the user if connection exists', done => {
			const user = generator.generateUser();
			const oauth = {
				providerId: uuid(),
				provider: 'LinkedOut',
				email: user.email
			};

			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					user.createdAt = u.get('createdAt');
					oauth.userId = user.userId;
					return OAuth.createAsync(oauth);
				})
				.then(() => {
					const profile = {
						id: oauth.providerId,
						displayName: user.displayName,
						provider: oauth.provider,
						emails: [{
							type: 'main',
							value: user.email
						}]
					};
					return getOrConnectOAuthAccount(user, profile);
				})
				.then(result => {
					expect(result).to.exist;
					expect(result).to.eql(user);
					done();
				})
				.catch(done);
		});

		it('will create connection and return user if necessary', done => {
			const user = generator.generateUser();
			const oauth = {
				providerId: uuid(),
				provider: 'LinkedOut',
				email: user.email
			};
			const profile = {
				id: oauth.providerId,
				displayName: user.displayName,
				provider: oauth.provider,
				emails: [{
					type: 'main',
					value: user.email
				}]
			};

			Users.createAsync(user)
				.then(newUser => {
					user.userId = newUser.get('userId');
					user.createdAt = newUser.get('createdAt');
					oauth.userId = user.userId;
					return getOrConnectOAuthAccount(user, profile);
				})
				.then(result => {
					expect(result).to.exist;
					expect(result).to.eql(user);
					return OAuth.getAsync(profile.id, profile.provider);
				})
				.then(result => {
					expect(result).to.not.be.null;
					expect(result.attrs).to.eql(oauth);
					done();
				})
				.catch(done);
		});

		it('will return error if connection exists and is bound to another user account', done => {
			const user = generator.generateUser();
			const oauth = {
				providerId: uuid(),
				provider: 'LinkedOut',
				userId: uuid(),
				email: 'another@user.com'
			};

			Bluebird.all([
				Users.createAsync(user),
				OAuth.createAsync(oauth)])
				.spread(u => {
					user.userId = u.get('userId');
					user.createdAt = u.get('createdAt');
				})
				.then(() => {
					const profile = {
						id: oauth.providerId,
						displayName: user.displayName,
						provider: oauth.provider,
						emails: [{
							type: 'main',
							value: user.email
						}]
					};
					return getOrConnectOAuthAccount(user, profile);
				})
				.then(() => {
					done('Operation was not meant to succeed.');
				})
				.catch(err => {
					expect(err.name).to.equal('ForbiddenActionError');
					done();
				})
				.catch(done);
		});

	});

	describe('removeOAuthConnection method', () => {

		const user = generator.generateUser();
		user.passwordHash = undefined;
		before(done => {
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					user.createdAt = u.get('createdAt');
					done();
				})
				.catch(done);
		});

		it('will remove the requested connection', done => {
			const oauth = [
				{
					providerId: uuid(),
					provider: 'noogle',
					userId: user.userId,
					email: user.email
				},
				{
					providerId: uuid(),
					provider: 'faceblam',
					userId: user.userId,
					email: user.email
				}
			];

			OAuth.createAsync(oauth)
				.then(() => {
					return removeOAuthConnection(user, 'faceblam');
				})
				.then(() => {
					return OAuth.getAsync(oauth[1].providerId, oauth[1].provider);
				})
				.then(result => {
					expect(result).to.be.null;
					done();
				})
				.catch(done);
		});

		it('will be a no-op if connection does not exist', done => {
			const oauth = [
				{
					providerId: uuid(),
					provider: 'noogle',
					userId: user.userId,
					email: user.email
				}
			];

			OAuth.createAsync(oauth)
				.then(() => {
					return removeOAuthConnection(user, 'faceblam');
				})
				.then(() => {
					done();
				})
				.catch(done);
		});

		it('will fail if user has no password set and has no other OAuth connections', done => {
			const oauth = {
				providerId: uuid(),
				provider: 'noogle',
				userId: user.userId,
				email: user.email
			};

			OAuth.createAsync(oauth)
				.then(() => {
					return removeOAuthConnection(user, 'noogle');
				})
				.then(() => done('Action was not meant to succeed.'))
				.catch(err => {
					expect(err.name).to.equal('ForbiddenActionError');
					done();
				})
				.catch(done);
		});

		it('will succeed if user has a password set and has no other OAuth connections', done => {
			const passwordUser = generator.generateUser();
			const oauth = {
				providerId: uuid(),
				provider: 'noogle',
				email: passwordUser.email
			};

			Users.createAsync(passwordUser)
				.then(u => {
					passwordUser.userId = u.get('userId');
					passwordUser.createdAt = u.get('createdAt');
					passwordUser.hasPassword = true;
					oauth.userId = passwordUser.userId;
					return OAuth.createAsync(oauth);
				})
				.then(() => {
					return removeOAuthConnection(passwordUser, 'noogle');
				})
				.then(() => {
					return OAuth.getAsync(oauth.providerId, oauth.provider);
				})
				.then(result => {
					expect(result).to.be.null;
					done();
				})
				.catch(done);
		});

	});
});
