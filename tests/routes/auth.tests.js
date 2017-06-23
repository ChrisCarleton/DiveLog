import { app } from '../../service/server';
import bcrypt from 'bcrypt';
import Bluebird from 'bluebird';
import { expect } from 'chai';
import log from '../../service/logger';
import { purgeTable } from '../test-utils';
import supertest from 'supertest';
import Users from '../../service/data/users.table';

const request = supertest(app);

const AUTH_ROUTE = '/api/auth/';
const LOGIN_ROUTE = AUTH_ROUTE + 'login/';
const LOGOUT_ROUTE = AUTH_ROUTE + 'logout/';

describe('Authentication routes', () => {

	let testUser;
	let idsToDestroy = [];

	const password = 'S3cr3tWrdz';
	const salt = bcrypt.genSaltSync(10);
	const passwordHash = bcrypt.hashSync(password, salt);

	beforeEach(() => {
		testUser = {
			userName: 'LegitUser2121',
			displayName: 'Vlad A. Count',
			email: 'honest_user2121@hotmail.com',
			passwordHash: passwordHash
		};
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
					expect(result.email).to.equal(testUser.email);
					expect(result.password).to.not.exist;
					expect(result.passwordHash).to.not.exist;

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

});
