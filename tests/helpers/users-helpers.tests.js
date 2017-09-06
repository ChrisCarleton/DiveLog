import _ from 'lodash';
import bcrypt from 'bcrypt';
import Bluebird from 'bluebird';
import generator from '../generator';
import { expect } from 'chai';
import faker from 'faker';
import moment from 'moment';
import OAuth from '../../service/data/oauth.table';
import { purgeTable } from '../test-utils';
import Users from '../../service/data/users.table';
import uuid from 'uuid/v4';

import {
	doChangePassword,
	doPerformPasswordReset,
	doRequestPasswordReset,
	doUpdateProfile,
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
				emails: [{ type: 'main', value: 'Davey666@gmail.com' }]
			};
		});

		it('will create a brand new account', done => {
			getOrCreateOAuthAccount(profile)
				.then(user => {
					expect(user).to.exist;
					expect(user.userName).to.match(/^[a-z0-9]{12}$/);
					expect(user.email).to.equal(profile.emails[0].value.toLowerCase());
					expect(user.displayEmail).to.equal(profile.emails[0].value);
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
					expect(user.userName).to.match(/^[a-z0-9]{12}$/);
					expect(user.email).to.equal(profile.emails[0].value.toLowerCase());
					expect(user.displayEmail).to.equal(profile.emails[0].value);
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
			const user = generator.generateUser();
			profile.emails[0].value = user.email;
			profile.displayName = user.displayName;

			Users.createAsync(user)
				.then(result => {
					expect(result).to.exist;
					user.userId = result.get('userId');
					user.createdAt = result.get('createdAt');

					return OAuth.createAsync({
						providerId: profile.id,
						provider: profile.provider,
						userId: user.userId,
						email: user.displayEmail
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
			profile.emails[0].value = user.displayEmail;

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
					expect(user.userName).to.match(/^[a-z0-9]{12}$/);
					expect(user.email).to.equal(profile.emails[0].value.toLowerCase());
					expect(user.displayEmail).to.equal(profile.emails[0].value);
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
					expect(user.email).to.equal(profile.emails[0].value.toLowerCase());
					expect(user.displayEmail).to.equal(profile.emails[0].value);
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
			const oauth = {
				providerId: uuid(),
				provider: 'noogle',
				userId: user.userId,
				email: user.email
			};

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

	describe('doChangePassword method', () => {

		const oldPassword = faker.internet.password(11);
		let user;

		beforeEach(() => {
			user = generator.generateUser(oldPassword);
		});

		it('will change the user\'s password', done => {
			const newPassword = 'OmFg@N3wP@srwrd.';
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return doChangePassword(user, oldPassword, newPassword);
				})
				.then(() => {
					return Users.getAsync(user.userId);
				})
				.then(userEntity => {
					expect(bcrypt.compareSync(newPassword, userEntity.get('passwordHash')))
						.to.be.true;
					done();
				})
				.catch(done);
		});

		it('will fail if old password is incorrect', done => {
			const oldHash = user.passwordHash;
			const newPassword = 'OmFg@N3wP@srwrd.';
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return doChangePassword(user, 'WrongFreakinPassw0rd!', newPassword);
				})
				.catch(err => {
					expect(err.name).to.equal('BadPasswordError');
					return Users.getAsync(user.userId);
				})
				.then(userEntity => {
					expect(userEntity.get('passwordHash')).to.equal(oldHash);
					done();
				})
				.catch(done);
		});

		it('will fail if new password does not meet stength criteria', done => {
			const oldHash = user.passwordHash;
			const newPassword = 'too weak';
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return doChangePassword(user, oldPassword, newPassword);
				})
				.catch(err => {
					expect(err.name).to.equal('WeakPasswordError');
					return Users.getAsync(user.userId);
				})
				.then(userEntity => {
					expect(userEntity.get('passwordHash')).to.equal(oldHash);
					done();
				})
				.catch(done);
		});

		it('will allow privileged users (admins) to change passwords without "oldPassword"', done => {
			const newPassword = 'OmFg@N3wP@srwrd.';
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return doChangePassword(user, null, newPassword, true);
				})
				.then(() => {
					return Users.getAsync(user.userId);
				})
				.then(userEntity => {
					expect(bcrypt.compareSync(newPassword, userEntity.get('passwordHash')))
						.to.be.true;
					done();
				})
				.catch(done);
		});
	});

	describe('doRequestPasswordReset method', () => {

		let user;
		beforeEach(() => {
			user = generator.generateUser();
		});

		it('will assign the user a 24-hour reset token and return it', done => {
			let retValue;
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return doRequestPasswordReset(user.email);
				})
				.then(result => {
					const almostADayFromNow = moment().add(23, 'h').add(59, 'm');
					retValue = result;
					const dayFromNow = moment().add(1, 'd');
					expect(result.passwordResetToken).to.exist;
					expect(result.passwordResetExpiration).to.exist;
					expect(moment(result.passwordResetExpiration).isBetween(almostADayFromNow, dayFromNow))
						.to.be.true;
					return Users.getAsync(user.userId);
				})
				.then(result => {
					expect(result.attrs).to.eql(retValue);
					done();
				})
				.catch(done);
		});

		it('will return null if e-mail address is not registered', done => {
			doRequestPasswordReset('not_an@email.com')
				.then(result => {
					expect(result).to.be.null;
					done();
				})
				.catch(done);
		});

		it('will return null if user does not have a password to reset (OAuth users)', done => {
			user.passwordHash = undefined;
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return doRequestPasswordReset(user.email);
				})
				.then(result => {
					expect(result).to.be.null;
					done();
				})
				.catch(done);
		});

	});

	describe('doPerformPasswordReset method', () => {

		let user;
		beforeEach(() => {
			user = generator.generateUser();
		});

		it('will set the user\'s new password and remove their reset token', done => {
			const resetToken = faker.random.alphaNumeric(20);
			const newPassword = 'T0T@11y-Noo';
			user.passwordResetToken = resetToken;
			user.passwordResetExpiration = moment().add(10, 'm').toISOString();
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return doPerformPasswordReset(user, resetToken, newPassword);
				})
				.then(result => {
					expect(result).to.be.true;
					return Users.getAsync(user.userId);
				})
				.then(result => {
					expect(bcrypt.compareSync(newPassword, result.get('passwordHash'))).to.be.true;
					expect(result.get('passwordResetExpiration')).to.not.exist;
					expect(result.get('passwordResetToken')).to.not.exist;
					done();
				})
				.catch(done);
		});

		it('will fail if reset token is invalid', done => {
			const newPassword = 'T0T@11y-Noo';

			user.passwordResetToken = faker.random.alphaNumeric(20);
			user.passwordResetExpiration = moment().add(4, 'h').toISOString();

			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return doPerformPasswordReset(user, 'notcorrecttoken', newPassword);
				})
				.then(() => {
					throw 'Action was not meant to succeed.';
				})
				.catch(err => {
					expect(err.name).to.equal('RejectedPasswordResetError');
					return Users.getAsync(user.userId);
				})
				.then(result => {
					expect(result.get('passwordHash')).to.equal(user.passwordHash);
					expect(result.get('passwordResetExpiration')).to.equal(user.passwordResetExpiration);
					expect(result.get('passwordResetToken')).to.equal(user.passwordResetToken);
					done();
				})
				.catch(done);
		});

		it('will fail if user does not have a reset token set', done => {
			const newPassword = 'T0T@11y-Noo';
			const token = faker.random.alphaNumeric(20);

			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return doPerformPasswordReset(user, token, newPassword);
				})
				.then(() => {
					throw 'Action was not meant to succeed.';
				})
				.catch(err => {
					expect(err.name).to.equal('RejectedPasswordResetError');
					return Users.getAsync(user.userId);
				})
				.then(result => {
					expect(result.get('passwordHash')).to.equal(user.passwordHash);
					expect(result.get('passwordResetExpiration')).to.equal(user.passwordResetExpiration);
					expect(result.get('passwordResetToken')).to.equal(user.passwordResetToken);
					done();
				})
				.catch(done);
		});

		it('will fail if reset token is expired', done => {
			const newPassword = 'T0T@11y-Noo';
			const token = faker.random.alphaNumeric(20);

			user.passwordResetToken = token;
			user.passwordResetExpiration = moment().subtract(20, 'm').toISOString();

			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return doPerformPasswordReset(user, token, newPassword);
				})
				.then(() => {
					throw 'Action was not meant to succeed.';
				})
				.catch(err => {
					expect(err.name).to.equal('RejectedPasswordResetError');
					return Users.getAsync(user.userId);
				})
				.then(result => {
					expect(result.get('passwordHash')).to.equal(user.passwordHash);
					expect(result.get('passwordResetExpiration')).to.equal(user.passwordResetExpiration);
					expect(result.get('passwordResetToken')).to.equal(user.passwordResetToken);
					done();
				})
				.catch(done);
		});

	});

	describe('doUpdateProfile method', () => {
		const newInfo = {
			location: 'London, UK',
			certificationAgencies: 'PADI, BSAC',
			diverType: 'typical',
			numberOfDives: '<500'
		};
		let user;

		beforeEach(() => {
			user = generator.generateUser();
		});

		after(done => {
			purgeTable(Users, 'userId')
				.then(() => done())
				.catch(done);
		});

		it('will update user\'s profile', done => {
			newInfo.email = user.displayEmail;
			Users.createAsync(user)
				.then(result => {
					user.userId = result.get('userId');
					return doUpdateProfile(user, newInfo);
				})
				.then(result => {
					expect(result).to.exist;
					const expected = {
						createdAt: result.createdAt,
						updatedAt: result.updatedAt
					};
					Object.assign(expected, user, newInfo);
					expect(result).to.eql(expected);
					done();
				})
				.catch(done);
		});

		it('will fail if new e-mail address is taken', done => {
			const otherUser = generator.generateUser();

			Bluebird.all([
				Users.createAsync(user),
				Users.createAsync(otherUser)])
				.spread((u, o) => {
					user.userId = u.get('userId');
					otherUser.userId = o.get('userId');
					return doUpdateProfile(user, { email: otherUser.displayEmail });
				})
				.then(() => {
					done('Operation was not meant to succeed.');
				})
				.catch(err => {
					expect(err.name).to.equal('EmailInUseError');
					done();
				})
				.catch(done);
		});

		it('will change user\'s email address if it is available.', done => {
			newInfo.email = faker.internet.email();

			Users.createAsync(user)
				.then(result => {
					user.userId = result.get('userId');
					return doUpdateProfile(user, newInfo);
				})
				.then(result => {
					expect(result).to.exist;
					const expected = {
						createdAt: result.createdAt,
						updatedAt: result.updatedAt,
						email: newInfo.email.toLowerCase(),
						displayEmail: newInfo.email
					};
					Object.assign(expected, user, newInfo);
					expect(result).to.eql(expected);
					done();
				})
				.catch(done);
		});
	});
});
