import _ from 'lodash';
import { app } from '../../service/server';
import bcrypt from 'bcrypt';
import Bluebird from 'bluebird';
import { expect } from 'chai';
import faker from 'faker';
import generator from '../generator';
import log from '../../service/logger';
import moment from 'moment';
import OAuth from '../../service/data/oauth.table';
import { purgeTable } from '../test-utils';
import sinon from 'sinon';
import supertest from 'supertest';
import { transporter } from '../../service/mail-sender';
import Users from '../../service/data/users.table';
import uuid from 'uuid/v4';

const request = supertest(app);

const AUTH_ROUTE = '/api/auth/';
const LOGIN_ROUTE = AUTH_ROUTE + 'login/';
const LOGOUT_ROUTE = AUTH_ROUTE + 'logout/';

describe('Authentication routes', () => {

	let testUser;
	let idsToDestroy = [];

	const password = 'S3cr3tWrdz';

	beforeEach(() => {
		testUser = generator.generateUser(password);
	});

	afterEach(done => {
		const promises = [];
		idsToDestroy.forEach(id => {
			promises.push(Users.destroyAsync(id));
		});

		idsToDestroy = [];

		Bluebird.all(promises)
			.then(() => done())
			.catch(done);
	});

	before(done => {
		purgeTable(Users, 'userId')
			.then(() => { done(); })
			.catch(done);
	});

	describe('login method', () => {

		it('will authenticate a valid user', done => {
			let userId;

			Users
				.createAsync(testUser)
				.then(result => {
					userId = result.get('userId');
					idsToDestroy.push(userId);

					return request
						.post(LOGIN_ROUTE)
						.send({
							username: testUser.userName,
							password: password
						})
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					return request
						.get('/api/user/')
						.set('cookie', res.headers['set-cookie'])
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					const result = res.body;
					expect(result).to.exist;
					expect(result.userId).to.exist;
					expect(result.userName).to.equal(testUser.userName);
					expect(result.displayName).to.equal(testUser.displayName);
					expect(result.email).to.equal(testUser.displayEmail);
					expect(result.password).to.not.exist;
					expect(result.passwordHash).to.not.exist;

					done();
				})
				.catch(done);
		});

		it('does not treat user name with case-sensitivity', done => {
			let userId;

			Users
				.createAsync(testUser)
				.then(result => {
					userId = result.get('userId');
					idsToDestroy.push(userId);

					return request
						.post(LOGIN_ROUTE)
						.send({
							username: testUser.userName.toUpperCase(),
							password: password
						})
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					return request
						.get('/api/user/')
						.set('cookie', res.headers['set-cookie'])
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					const result = res.body;
					expect(result).to.exist;
					expect(result.userId).to.exist;
					expect(result.userName).to.equal(testUser.userName);
					expect(result.displayName).to.equal(testUser.displayName);
					expect(result.email).to.equal(testUser.displayEmail);
					expect(result.password).to.not.exist;
					expect(result.passwordHash).to.not.exist;

					done();
				})
				.catch(done);
		});

		it('will return 401 if the user does not have a password hash (OAuth users!)', done => {
			let userId;
			testUser.passwordHash = undefined;

			Users
				.createAsync(testUser)
				.then(result => {
					userId = result.get('userId');
					idsToDestroy.push(userId);

					return request
						.post(LOGIN_ROUTE)
						.send({
							username: testUser.userName,
							password: ''
						})
						.expect('Content-Type', /json/)
						.expect(401);
				})
				.then(result => {
					expect(result.body.errorId).to.equal(3000);
					expect(result.headers['set-cookie']).to.not.exist;
					done();
				})
				.catch(done);
		});

		it('will return 401 if the password is incorrect', done => {
			let userId;

			Users
				.createAsync(testUser)
				.then(result => {
					userId = result.get('userId');
					idsToDestroy.push(userId);

					return request
						.post(LOGIN_ROUTE)
						.send({
							username: testUser.userName,
							password: 'WrongP@ssw3rd'
						})
						.expect('Content-Type', /json/)
						.expect(401);
				})
				.then(res => {
					expect(res.body).to.eql({
						errorId: 3000,
						error: 'Authentication failed',
						details: 'The user could not be authenticated. Either the user name or password (or both) is incorrect.'
					});
					expect(res.headers['set-cookie']).to.not.exist;

					done();
				})
				.catch(done);
		});

		it('will return 401 if the user does not exist', done => {
			let userId;

			Users
				.createAsync(testUser)
				.then(result => {
					userId = result.get('userId');
					idsToDestroy.push(userId);

					return request
						.post(LOGIN_ROUTE)
						.send({
							username: 'NonExistentUser',
							password: password
						})
						.expect('Content-Type', /json/)
						.expect(401);
				})
				.then(res => {
					expect(res.body).to.eql({
						errorId: 3000,
						error: 'Authentication failed',
						details: 'The user could not be authenticated. Either the user name or password (or both) is incorrect.'
					});
					expect(res.headers['set-cookie']).to.not.exist;

					done();
				})
				.catch(done);
		});

		it('will return 401 if the user name is missing', done => {
			let userId;

			Users
				.createAsync(testUser)
				.then(result => {
					userId = result.get('userId');
					idsToDestroy.push(userId);

					return request
						.post(LOGIN_ROUTE)
						.send({
							username: undefined,
							password: password
						})
						.expect('Content-Type', /json/)
						.expect(401);
				})
				.then(res => {
					expect(res.body).to.eql({
						errorId: 3000,
						error: 'Authentication failed',
						details: 'The user could not be authenticated. Either the user name or password (or both) is incorrect.'
					});
					expect(res.headers['set-cookie']).to.not.exist;

					done();
				})
				.catch(done);
		});

		it('will return 401 if the password is missing', done => {
			let userId;

			Users
				.createAsync(testUser)
				.then(result => {
					userId = result.get('userId');
					idsToDestroy.push(userId);

					return request
						.post(LOGIN_ROUTE)
						.send({
							username: testUser.userName,
							password: undefined
						})
						.expect('Content-Type', /json/)
						.expect(401);
				})
				.then(res => {
					expect(res.body).to.eql({
						errorId: 3000,
						error: 'Authentication failed',
						details: 'The user could not be authenticated. Either the user name or password (or both) is incorrect.'
					});
					expect(res.headers['set-cookie']).to.not.exist;

					done();
				})
				.catch(done);
		});

	});

	describe('logout method', () => {

		it('will end an active session', done => {
			let userId;

			Users
				.createAsync(testUser)
				.then(result => {
					userId = result.get('userId');
					idsToDestroy.push(userId);

					return request
						.post(LOGIN_ROUTE)
						.send({
							username: 'NonExistentUser',
							password: password
						})
						.expect('Content-Type', /json/)
						.expect(401);
				})
				.then(() => {
					return request
						.post(LOGOUT_ROUTE)
						.expect(200);
				})
				.then(res => {
					log.debug('Response Headers:', res.headers);
					return request
						.get('/api/user/')
						.expect(401);
				})
				.then(() => { done(); })
				.catch(done);
		});

		it('will do nothing if there is no active session', done => {
			request
				.post(LOGOUT_ROUTE)
				.expect(200)
				.then(() => {
					return request
						.get('/api/user/')
						.expect(401);
				})
				.then(() => { done(); })
				.catch(done);
		});

	});

	describe('listOAuthAccounts method', () => {

		const TEST_PASSWORD = 'SSadCL0wn>';

		let user1, user2, admin;
		before(done => {
			user1 = generator.generateUser(TEST_PASSWORD);
			user2 = generator.generateUser(TEST_PASSWORD);
			admin = generator.generateUser(TEST_PASSWORD);
			admin.role = 'admin';
			Bluebird.all([
				Users.createAsync(user1),
				Users.createAsync(user2),
				Users.createAsync(admin)])
				.spread((u1, u2, a) => {
					user1.userId = u1.get('userId');
					user2.userId = u2.get('userId');
					admin.userId = a.get('userId');
					done();
				})
				.catch(done);
		});

		after(done => {
			purgeTable(Users, 'userId')
				.then(() => { done(); })
				.catch(done);
		});

		afterEach(done => {
			purgeTable(OAuth, 'providerId', 'provider')
				.then(() => { done(); })
				.catch(done);
		});

		it('will return a users\' connected OAuth providers', done => {
			const oauth = [
				{
					providerId: uuid(),
					provider: 'InstaBook',
					userId: user1.userId,
					email: user1.email
				},
				{
					providerId: uuid(),
					provider: 'Facegram',
					userId: user1.userId,
					email: user1.email
				},
				{
					providerId: uuid(),
					provider: 'Twinterest',
					userId: user2.userId,
					email: user2.email
				}
			];

			OAuth
				.createAsync(oauth)
				.then(() => {
					return request
						.post(LOGIN_ROUTE)
						.send({
							username: user1.userName,
							password: TEST_PASSWORD
						})
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					return request
						.get(`/api/auth/${user1.userName}/oauth`)
						.set('cookie', res.headers['set-cookie'])
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					const expected = ['InstaBook', 'Facegram'];
					const difference = _.difference(expected, res.body);
					expect(difference).to.be.empty;
					done();
				})
				.catch(done);
		});

		it('will return an empty array if the user has no providers connected', done => {
			request
				.post(LOGIN_ROUTE)
				.send({
					username: user1.userName,
					password: TEST_PASSWORD
				})
				.expect('Content-Type', /json/)
				.expect(200)
				.then(res => {
					return request
						.get(`/api/auth/${user1.userName}/oauth`)
						.set('cookie', res.headers['set-cookie'])
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					expect(res.body).to.be.an('array');
					expect(res.body).to.be.empty;
					done();
				})
				.catch(done);
		});

		it('will return 401 if user is not authorized to list the OAuth providers', done => {
			request
				.post(LOGIN_ROUTE)
				.send({
					username: user1.userName,
					password: TEST_PASSWORD
				})
				.expect('Content-Type', /json/)
				.expect(200)
				.then(res => {
					return request
						.get(`/api/auth/${user2.userName}/oauth`)
						.set('cookie', res.headers['set-cookie'])
						.expect('Content-Type', /json/)
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will return 401 if user is unauthencticated', done => {
			request
				.get(`/api/auth/${user2.userName}/oauth`)
				.expect('Content-Type', /json/)
				.expect(401)
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will return 401 if user does not exist', done => {
			request
				.post(LOGIN_ROUTE)
				.send({
					username: user1.userName,
					password: TEST_PASSWORD
				})
				.expect('Content-Type', /json/)
				.expect(200)
				.then(res => {
					return request
						.get('/api/auth/fakeuser/oauth')
						.set('cookie', res.headers['set-cookie'])
						.expect('Content-Type', /json/)
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('admins can list other users\' OAuth providers', done => {
			const oauth = [
				{
					providerId: uuid(),
					provider: 'InstaBook',
					userId: user1.userId,
					email: user1.email
				},
				{
					providerId: uuid(),
					provider: 'Facegram',
					userId: user1.userId,
					email: user1.email
				},
				{
					providerId: uuid(),
					provider: 'Twinterest',
					userId: user2.userId,
					email: user2.email
				}
			];

			OAuth
				.createAsync(oauth)
				.then(() => {
					return request
						.post(LOGIN_ROUTE)
						.send({
							username: admin.userName,
							password: TEST_PASSWORD
						})
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					return request
						.get(`/api/auth/${user1.userName}/oauth`)
						.set('cookie', res.headers['set-cookie'])
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					const expected = ['InstaBook', 'Facegram'];
					const difference = _.difference(expected, res.body);
					expect(difference).to.be.empty;
					done();
				})
				.catch(done);
		});

		it('will return empty array to admins if user does not exist', done => {
			request
				.post(LOGIN_ROUTE)
				.send({
					username: admin.userName,
					password: TEST_PASSWORD
				})
				.expect('Content-Type', /json/)
				.expect(200)
				.then(res => {
					return request
						.get('/api/auth/fakeuser/oauth')
						.set('cookie', res.headers['set-cookie'])
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					expect(res.body).to.be.an('array');
					expect(res.body).to.be.empty;
					done();
				})
				.catch(done);
		});

	});

	describe('removeOAuthAccount method', () => {

		const TEST_PASSWORD = 'SSadCL0wn>';

		let user1, user2, admin;
		let oauth;
		before(done => {
			user1 = generator.generateUser(TEST_PASSWORD);
			user2 = generator.generateUser(TEST_PASSWORD);
			admin = generator.generateUser(TEST_PASSWORD);

			admin.role = 'admin';

			Bluebird.all([
				Users.createAsync(user1),
				Users.createAsync(user2),
				Users.createAsync(admin)])
				.spread((u1, u2, a) => {
					user1.userId = u1.get('userId');
					user2.userId = u2.get('userId');
					admin.userId = a.get('userId');
					oauth = [
						{
							providerId: uuid(),
							provider: 'google',
							userId: user1.userId,
							email: user1.email
						},
						{
							providerId: uuid(),
							provider: 'github',
							userId: user1.userId,
							email: user1.email
						},
						{
							providerId: uuid(),
							provider: 'facebook',
							userId: user2.userId,
							email: user2.email
						},
						{
							providerId: uuid(),
							provider: 'google',
							userId: user2.userId,
							email: user2.email
						}
					];
					done();
				})
				.catch(done);
		});

		after(done => {
			purgeTable(Users, 'userId')
				.then(() => { done(); })
				.catch(done);
		});

		afterEach(done => {
			purgeTable(OAuth, 'providerId', 'provider')
				.then(() => { done(); })
				.catch(done);
		});

		it('will remove requested OAuth account', done => {
			OAuth.createAsync(oauth)
				.then(() => {
					return request
						.post(LOGIN_ROUTE)
						.send({
							username: user1.userName,
							password: TEST_PASSWORD
						})
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(result => {
					return request
						.delete(`/api/auth/${user1.userName}/oauth/google`)
						.set('cookie', result.headers['set-cookie'])
						.expect(200);
				})
				.then(() => {
					return OAuth
						.query(user1.userId)
						.usingIndex('UserIdIndex')
						.loadAll()
						.execAsync();
				})
				.then(result => {
					expect(result.Items.length).to.equal(1);
					expect(result.Items[0].get('provider')).to.not.equal('google');
					done();
				})
				.catch(done);
		});

		it('will return 401 if user is not authorized to remove account', done => {
			OAuth.createAsync(oauth)
				.then(() => {
					return request
						.post(LOGIN_ROUTE)
						.send({
							username: user1.userName,
							password: TEST_PASSWORD
						})
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(result => {
					return request
						.delete(`/api/auth/${user2.userName}/oauth/google`)
						.set('cookie', result.headers['set-cookie'])
						.expect(401);
				})
				.then(result => {
					expect(result.body.errorId).to.equal(3100);
					return OAuth
						.query(user2.userId)
						.usingIndex('UserIdIndex')
						.loadAll()
						.execAsync();
				})
				.then(result => {
					expect(result.Items.length).to.equal(2);
					done();
				})
				.catch(done);
		});

		it('will return 401 if user is not authenticated', done => {
			OAuth.createAsync(oauth)
				.then(() => {
					return request
						.delete(`/api/auth/${user2.userName}/oauth/google`)
						.expect(401);
				})
				.then(result => {
					expect(result.body.errorId).to.equal(3100);
					return OAuth
						.query(user2.userId)
						.usingIndex('UserIdIndex')
						.loadAll()
						.execAsync();
				})
				.then(result => {
					expect(result.Items.length).to.equal(2);
					done();
				})
				.catch(done);
		});

		it('will return 401 to users if profile owner does not exist', done => {
			OAuth.createAsync(oauth)
				.then(() => {
					return request
						.post(LOGIN_ROUTE)
						.send({
							username: user1.userName,
							password: TEST_PASSWORD
						})
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(result => {
					return request
						.delete('/api/auth/fakeuser/oauth/google')
						.set('cookie', result.headers['set-cookie'])
						.expect(401);
				})
				.then(result => {
					expect(result.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will return 404 to admins if profile owner does not exist', done => {
			OAuth.createAsync(oauth)
				.then(() => {
					return request
						.post(LOGIN_ROUTE)
						.send({
							username: admin.userName,
							password: TEST_PASSWORD
						})
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(result => {
					return request
						.delete('/api/auth/fakeuser/oauth/google')
						.set('cookie', result.headers['set-cookie'])
						.expect(404);
				})
				.then(result => {
					expect(result.body.errorId).to.equal(2100);
					done();
				})
				.catch(done);
		});

		it('admins can remove other users\' connections', done => {
			OAuth.createAsync(oauth)
				.then(() => {
					return request
						.post(LOGIN_ROUTE)
						.send({
							username: admin.userName,
							password: TEST_PASSWORD
						})
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(result => {
					return request
						.delete(`/api/auth/${user1.userName}/oauth/google`)
						.set('cookie', result.headers['set-cookie'])
						.expect(200);
				})
				.then(() => {
					return OAuth
						.query(user1.userId)
						.usingIndex('UserIdIndex')
						.loadAll()
						.execAsync();
				})
				.then(result => {
					expect(result.Items.length).to.equal(1);
					expect(result.Items[0].get('provider')).to.not.equal('google');
					done();
				})
				.catch(done);
		});

		it('will return 400 if user tries to remove an invalid account', done => {
			OAuth.createAsync(oauth)
				.then(() => {
					return request
						.post(LOGIN_ROUTE)
						.send({
							username: user1.userName,
							password: TEST_PASSWORD
						})
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(result => {
					return request
						.delete(`/api/auth/${user1.userName}/oauth/noogle`)
						.set('cookie', result.headers['set-cookie'])
						.expect(400);
				})
				.then(result => {
					expect(result.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 200 if user tries to remove a connection that is not there', done => {
			OAuth.createAsync(oauth)
				.then(() => {
					return request
						.post(LOGIN_ROUTE)
						.send({
							username: user1.userName,
							password: TEST_PASSWORD
						})
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(result => {
					return request
						.delete(`/api/auth/${user1.userName}/oauth/facebook`)
						.set('cookie', result.headers['set-cookie'])
						.expect(200);
				})
				.then(() => done())
				.catch(done);
		});

		it('will return 403 if user tries to remove a connection when there are no others and user does not have a password', done => {
			let cookie;

			OAuth.createAsync(oauth[2])
				.then(() => {
					return request
						.post(LOGIN_ROUTE)
						.send({
							username: user2.userName,
							password: TEST_PASSWORD
						})
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(result => {
					cookie = result.headers['set-cookie'];
					return Users.updateAsync({ userId: user2.userId, passwordHash: null });
				})
				.then(() => {
					return request
						.delete(`/api/auth/${user2.userName}/oauth/facebook`)
						.set('cookie', cookie)
						.expect(403);
				})
				.then(result => {
					expect(result.body.errorId).to.equal(3200);
					done();
				})
				.catch(done);
		});

	});

});

describe('Password routes:', () => {
	const TEST_USER_PASSWORD = 'OmG!!@_Passw3rd4ME.';
	const
		user1 = generator.generateUser(TEST_USER_PASSWORD),
		user2 = generator.generateUser(TEST_USER_PASSWORD),
		admin = generator.generateUser(TEST_USER_PASSWORD),
		cookies = {};
	admin.role = 'admin';

	const purgeUserTable = done => {
		purgeTable(Users, 'userId')
			.then(() => done())
			.catch(done);
	};

	const loginUser = user => {
		if (cookies[user.userName]) {
			return Bluebird.resolve(cookies[user.userName]);
		}

		return request
			.post(LOGIN_ROUTE)
			.send({
				username: user.userName,
				password: TEST_USER_PASSWORD
			})
			.expect(200)
			.then(res => {
				cookies[user.userName] = res.headers['set-cookie'];
				return cookies[user.userName];
			});
	};

	before(purgeUserTable);
	afterEach(purgeUserTable);

	describe('Change password:', () => {
		it('will change the user\'s password and return 200', done => {
			const newPassword = 'Am@Zng__M3!';

			Users.createAsync(user1)
				.then(u => {
					user1.userId = u.get('userId');
					return loginUser(user1);
				})
				.then(cookie => {
					return request
						.post(`/api/auth/${user1.userName}/password`)
						.set('cookie', cookie)
						.send({
							oldPassword: TEST_USER_PASSWORD,
							newPassword: newPassword
						})
						.expect(200);
				})
				.then(() => {
					return Users.getAsync(user1.userId);
				})
				.then(result => {
					const hash = result.get('passwordHash');
					expect(bcrypt.compareSync(newPassword, hash)).to.be.true;
					done();
				})
				.catch(done);
		});

		it('will return 401 if old password is incorrect', done => {
			const newPassword = 'Am@Zng__M3!';

			Users.createAsync(user1)
				.then(u => {
					user1.userId = u.get('userId');
					return loginUser(user1);
				})
				.then(cookie => {
					return request
						.post(`/api/auth/${user1.userName}/password`)
						.set('cookie', cookie)
						.send({
							oldPassword: 'Wr0nNg--Pss',
							newPassword: newPassword
						})
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					return Users.getAsync(user1.userId);
				})
				.then(result => {
					const hash = result.get('passwordHash');
					expect(bcrypt.compareSync(TEST_USER_PASSWORD, hash)).to.be.true;
					done();
				})
				.catch(done);
		});

		it('will return 400 if new password does not meet strength requirements', done => {
			const newPassword = 'granny1';

			Users.createAsync(user1)
				.then(u => {
					user1.userId = u.get('userId');
					return loginUser(user1);
				})
				.then(cookie => {
					return request
						.post(`/api/auth/${user1.userName}/password`)
						.set('cookie', cookie)
						.send({
							oldPassword: 'Wr0nNg--Pss',
							newPassword: newPassword
						})
						.expect(400);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					return Users.getAsync(user1.userId);
				})
				.then(result => {
					const hash = result.get('passwordHash');
					expect(bcrypt.compareSync(TEST_USER_PASSWORD, hash)).to.be.true;
					done();
				})
				.catch(done);
		});

		it('will return 401 if user tries to change someone else\'s password', done => {
			const newPassword = 'Am@Zng__M3!';

			Users.createAsync(user1)
				.then(u => {
					user1.userId = u.get('userId');
					return Users.createAsync(user2);
				})
				.then(u => {
					user2.userId = u.get('userId');
					return loginUser(user1);
				})
				.then(cookie => {
					return request
						.post(`/api/auth/${user2.userName}/password`)
						.set('cookie', cookie)
						.send({
							oldPassword: TEST_USER_PASSWORD,
							newPassword: newPassword
						})
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					return Users.getAsync(user1.userId);
				})
				.then(res => {
					expect(bcrypt.compareSync(TEST_USER_PASSWORD, res.get('passwordHash')))
						.to.be.true;
					done();
				})
				.catch(done);
		});

		it('will return 401 if user is unauthenticated', done => {
			const newPassword = 'Am@Zng__M3!';

			Users.createAsync(user1)
				.then(u => {
					user1.userId = u.userId;
					return request
						.post(`/api/auth/${user1.userName}/password`)
						.send({
							oldPassword: TEST_USER_PASSWORD,
							newPassword: newPassword
						})
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will allow admins to change passwords without oldPassword', done => {
			const newPassword = 'Am@Zng__M3!';

			Users.createAsync(user1)
				.then(u => {
					user1.userId = u.get('userId');
					return Users.createAsync(admin);
				})
				.then(a => {
					admin.userId = a.get('userId');
					return loginUser(admin);
				})
				.then(cookie => {
					return request
						.post(`/api/auth/${user1.userName}/password`)
						.set('cookie', cookie)
						.send({
							newPassword: newPassword
						})
						.expect(200);
				})
				.then(() => {
					return Users.getAsync(user1.userId);
				})
				.then(result => {
					const hash = result.get('passwordHash');
					expect(bcrypt.compareSync(newPassword, hash)).to.be.true;
					done();
				})
				.catch(done);
		});

		it('will return 404 if an administrator tries to change the password of a non-existent user', done => {
			const newPassword = 'Am@Zng__M3!';

			Users.createAsync(admin)
				.then(a => {
					admin.userId = a.get('userId');
					return loginUser(admin);
				})
				.then(cookie => {
					return request
						.post(`/api/auth/${user1.userName}/password`)
						.set('cookie', cookie)
						.send({
							newPassword: newPassword
						})
						.expect(404);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(2100);
					done();
				})
				.catch(done);
		});
	});

	describe('Request password reset:', () => {

		let mailStub;
		beforeEach(() => {
			mailStub = sinon.stub(transporter, 'sendMailAsync');
			mailStub.usingPromise(Bluebird.Promise);
			mailStub.resolves(true);
		});

		afterEach(() => {
			mailStub.restore();
		});

		after(purgeUserTable);

		const REQUEST_RESET_ROUTE = '/api/auth/resetPassword';

		it('will return 200 and send an email if successful', done => {
			const user = generator.generateUser();
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return request
						.get(REQUEST_RESET_ROUTE)
						.query({ email: user.email })
						.expect(200);
				})
				.then(() => {
					expect(mailStub.calledOnce).to.be.true;
					return Users.getAsync(user.userId);
				})
				.then(result => {
					const expectedExpiration = moment().add(1, 'd');
					const actualExpiration = moment(result.get('passwordResetExpiration'));
					expect(result.get('passwordResetToken'))
						.to
						.match(/^[a-z0-9]{20}$/i);
					expect(actualExpiration.isSame(expectedExpiration, 'minute')).to.be.true;
					done();
				})
				.catch(done);
		});

		it('will fail silently (200) if the e-mail address is not registered', done => {
			request
				.get(REQUEST_RESET_ROUTE)
				.query({ email: 'jake@gmail.com' })
				.expect(200)
				.then(() => {
					expect(mailStub.called).to.be.false;
					done();
				})
				.catch(done);
		});

		it('will return 400 if the email parameter is missing from the query string', done => {
			request
				.get(REQUEST_RESET_ROUTE)
				.expect(400)
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 400 if the email parameter is not a valid address', done => {
			request
				.get(REQUEST_RESET_ROUTE)
				.query({ email: 'not valid' })
				.expect(400)
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 500 if email cannot be delivered', done => {
			const user = generator.generateUser();
			mailStub.rejects('OMG! Email error!!');

			Users.createAsync(user)
				.then(() => {
					return request
						.get(REQUEST_RESET_ROUTE)
						.query({ email: user.email })
						.expect(500);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(2000);
					done();
				})
				.catch(done);
		});

	});

	describe('Perform password reset:', () => {
		const newPassword = 'L3t--ThmEAt.C@k3';
		let user;
		beforeEach(() => {
			user = generator.generateUser();
			user.passwordResetToken = faker.random.alphaNumeric(20);
			user.passwordResetExpiration = moment().add(1, 'd').toISOString();
		});
		after(purgeUserTable);

		it('will change the users password', done => {
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return request
						.post(`/api/auth/${user.userName}/resetPassword`)
						.send({
							token: user.passwordResetToken,
							newPassword: newPassword
						})
						.expect(200);
				})
				.then(() => {
					return Users.getAsync(user.userId);
				})
				.then(result => {
					const hash = result.get('passwordHash');
					expect(bcrypt.compareSync(newPassword, hash)).to.be.true;
					done();
				})
				.catch(done);
		});

		it('will return 400 if new password is missing', done => {
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return request
						.post(`/api/auth/${user.userName}/resetPassword`)
						.send({
							token: user.passwordResetToken
						})
						.expect(400);
				})
				.then(() => {
					return Users.getAsync(user.userId);
				})
				.then(result => {
					const hash = result.get('passwordHash');
					expect(bcrypt.compareSync(newPassword, hash)).to.be.false;
					done();
				})
				.catch(done);
		});

		it('will return 400 if token is missing', done => {
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return request
						.post(`/api/auth/${user.userName}/resetPassword`)
						.send({
							newPassword: newPassword
						})
						.expect(400);
				})
				.then(() => {
					return Users.getAsync(user.userId);
				})
				.then(result => {
					const hash = result.get('passwordHash');
					expect(bcrypt.compareSync(newPassword, hash)).to.be.false;
					done();
				})
				.catch(done);
		});

		it('will return 400 if new password does not meet strength requirements', done => {
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return request
						.post(`/api/auth/${user.userName}/resetPassword`)
						.send({
							newPassword: 'too weak',
							token: user.passwordResetToken
						})
						.expect(400);
				})
				.then(() => {
					return Users.getAsync(user.userId);
				})
				.then(result => {
					const hash = result.get('passwordHash');
					expect(bcrypt.compareSync(newPassword, hash)).to.be.false;
					done();
				})
				.catch(done);
		});

		it('will return 401 if user does not exist', done => {
			user.userId = uuid();
			request
				.post(`/api/auth/${user.userName}/resetPassword`)
				.send({
					token: user.passwordResetToken,
					newPassword: newPassword
				})
				.expect(401)
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will return 401 if token is incorrect', done => {
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return request
						.post(`/api/auth/${user.userName}/resetPassword`)
						.send({
							token: 'badtoken1234',
							newPassword: newPassword
						})
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					return Users.getAsync(user.userId);
				})
				.then(result => {
					const hash = result.get('passwordHash');
					expect(bcrypt.compareSync(newPassword, hash)).to.be.false;
					done();
				})
				.catch(done);
		});

		it('will return 401 if token is expired', done => {
			user.passwordResetExpiration = moment().subtract(5, 'm').toISOString();
			Users.createAsync(user)
				.then(u => {
					user.userId = u.get('userId');
					return request
						.post(`/api/auth/${user.userName}/resetPassword`)
						.send({
							token: user.passwordResetToken,
							newPassword: newPassword
						})
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					return Users.getAsync(user.userId);
				})
				.then(result => {
					const hash = result.get('passwordHash');
					expect(bcrypt.compareSync(newPassword, hash)).to.be.false;
					done();
				})
				.catch(done);
		});
	});

});
