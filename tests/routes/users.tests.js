import { app } from '../../service/server';
import bcrypt from 'bcrypt';
import Bluebird from 'bluebird';
import { expect } from 'chai';
//import log from '../../service/logger';
import { purgeTable } from '../test-utils';
import supertest from 'supertest';
import Users from '../../service/data/users.table';

const request = supertest(app);
const testValidation = (route, data, expectedErr, done) => {
	request
		.post(route)
		.send(data)
		.expect('Content-Type', /json/)
		.expect(400)
		.then(res => {
			expect(res.body).to.eql(expectedErr);
			done();
		})
		.catch(done);
};

const USERS_ROUTE = '/api/users/';

describe('User routes', () => {

	describe('create user', () => {

		const password = 'j0esP@ssw0rd';
		let idsToDestroy = [];
		let testUser;

		before(done => {
			purgeTable(Users, 'userId')
				.then(() => { done(); })
				.catch(done);
		});

		beforeEach(() => {
			testUser = {
				userName: 'JoeTesterson',
				displayName: 'Joe C Testerson',
				email: 'test@testerson.ca',
				password: password
			};
		})

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

		it('users can be created', done => {
			let userId;

			request
				.post(USERS_ROUTE)
				.send(testUser)
				.expect('Content-Type', /json/)
				.expect(200)
				.then(res => {
					const result = res.body;
					expect(result.userId).to.exist;
					expect(result.userName).to.equal(testUser.userName);
					expect(result.displayName).to.equal(testUser.displayName);
					expect(result.passwordHash).to.not.exist;
					expect(result.email).to.equal(testUser.email);
					expect(result.role).to.equal('user');

					userId = result.userId;
					idsToDestroy.push(userId);
					return Users.getAsync(result.userId);
				})
				.then(savedUser => {
					expect(savedUser).to.exist;
					expect(savedUser.get('userId')).to.equal(userId);
					expect(savedUser.get('userName')).to.equal(testUser.userName);
					expect(savedUser.get('displayName')).to.equal(testUser.displayName);
					expect(savedUser.get('email')).to.equal(testUser.email);
					expect(savedUser.get('role')).to.equal('user');

					const passwordHash = savedUser.get('passwordHash');
					expect(bcrypt.compareSync(testUser.password, passwordHash)).to.be.true;

					done();
				})
				.catch(done);
		});

		it('creating an account logs in the new user', done => {
			request
				.post(USERS_ROUTE)
				.send(testUser)
				.expect('Content-Type', /json/)
				.expect(200)
				.then(res => {
					const result = res.body;
					expect(result).to.exist;
					expect(result.userId).to.exist;

					idsToDestroy.push(result.userId);

					return request
						.get('/api/user/')
						.set('cookie', res.headers['set-cookie'])
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					const result = res.body;
					expect(result.userId).to.exist;
					expect(result.userName).to.equal(testUser.userName);
					expect(result.displayName).to.equal(testUser.displayName);
					expect(result.passwordHash).to.not.exist;
					expect(result.email).to.equal(testUser.email);
					expect(result.role).to.equal('user');

					done();
				})
				.catch(done);
		});

		it('user is rejected if user name is missing', done => {
			testUser.userName = undefined;
			testValidation(
				USERS_ROUTE,
				testUser,
				{
					errorId: 1000,
					error: 'Bad request: Validation failed.',
					details: [
						{
							context: {
								key: 'userName'
							},
							message: '"userName" is required',
							path: 'userName',
							type: 'any.required'
						}
					]
				},
				done);
		});

		it('user is rejected if user name is invalid', done => {
			testUser.userName = '@@ NOtl Va!!lid atALL';
			testValidation(
				USERS_ROUTE,
				testUser,
				{
					errorId: 1000,
					error: 'Bad request: Validation failed.',
					details: [
						{
							context: {
								key: 'userName',
								pattern: {},
								value: '@@ NOtl Va!!lid atALL'
							},
							message: '"userName" with value "&#x40;&#x40; NOtl Va&#x21;&#x21;lid atALL" fails to match the required pattern: /^[0-9a-zA-Z][0-9a-zA-Z.-]*[0-9a-zA-Z]$/',
							path: 'userName',
							type: 'string.regex.base'
						}
					]
				},
				done);
		});

		it('user is rejected if email is missing', done => {
			testUser.email = undefined;
			testValidation(
				USERS_ROUTE,
				testUser,
				{
					errorId: 1000,
					error: 'Bad request: Validation failed.',
					details: [
						{
							context: {
								key: 'email'
							},
							message: '"email" is required',
							path: 'email',
							type: 'any.required'
						}
					]
				},
				done);
		});

		it('user is rejected if email is invalid', done => {
			testUser.email = 'this is not an e-mail address';
			testValidation(
				USERS_ROUTE,
				testUser,
				{
					errorId: 1000,
					error: 'Bad request: Validation failed.',
					details: [
						{
							context: {
								key: 'email',
								value: 'this is not an e-mail address'
							},
							message: '"email" must be a valid email',
							path: 'email',
							type: 'string.email'
						}
					]
				},
				done);
		});

		it('user is rejected password is missing', done => {
			testUser.password = undefined;
			testValidation(
				USERS_ROUTE,
				testUser,
				{
					errorId: 1000,
					error: 'Bad request: Validation failed.',
					details: [
						{
							context: {
								key: 'password'
							},
							message: '"password" is required',
							path: 'password',
							type: 'any.required'
						}
					]
				},
				done);
		});

		it('user is rejected if password is weak', done => {
			testUser.password = 'TooWeak';
			testValidation(
				USERS_ROUTE,
				testUser,
				{
					errorId: 1000,
					error: 'Bad request: Validation failed.',
					details: [
						{
							context: {
								key: 'password',
								pattern: {},
								value: 'TooWeak'
							},
							message: '"password" with value "TooWeak" fails to match the required pattern: /^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]*$/',
							path: 'password',
							type: 'string.regex.base'
						}
					]
				},
				done);
		});

		it('user is rejected if display name is too long', done => {
			testUser.displayName
				= 'OMFG, this is a really long display name. I mean, seriously, this is long, isn\'t? I should really think about shortening this.';
			testValidation(
				USERS_ROUTE,
				testUser,
				{
					errorId: 1000,
					error: 'Bad request: Validation failed.',
					details: [
						{
							context: {
								key: 'displayName',
								limit: 100,
								value: testUser.displayName
							},
							message: '"displayName" length must be less than or equal to 100 characters long',
							path: 'displayName',
							type: 'string.max'
						}
					]
				},
				done);
		});

		it('user creation is rejected if user name is taken', done => {
			const salt = bcrypt.genSaltSync(10);
			const passwordHash = bcrypt.hashSync(testUser.password, salt);

			Users.createAsync({
					userName: testUser.userName,
					passwordHash: passwordHash,
					displayName: testUser.displayName,
					email: testUser.email
				})
				.then(result => {
					idsToDestroy.push(result.get('userId'));
					testUser.email = 'different_now@email.com';

					return request
						.post(USERS_ROUTE)
						.send(testUser)
						.expect('Content-Type', /json/)
						.expect(400);
				})
				.then(res => {
					expect(res.body).to.eql({
						errorId: 1010,
						error: 'User name already taken',
						details: 'The user name you selected is already in use. Please select a unique user name or ' +
							'if you already have an account, try reseting your password.'
					});
					done();
				})
				.catch(done);
		});

		it('user creation is rejected if email address is taken', done => {
			const salt = bcrypt.genSaltSync(10);
			const passwordHash = bcrypt.hashSync(testUser.password, salt);

			Users.createAsync({
					userName: testUser.userName,
					passwordHash: passwordHash,
					displayName: testUser.displayName,
					email: testUser.email
				})
				.then(result => {
					idsToDestroy.push(result.get('userId'));
					testUser.userName = 'DifferentUserName';

					return request
						.post(USERS_ROUTE)
						.send(testUser)
						.expect('Content-Type', /json/)
						.expect(400);
				})
				.then(res => {
					expect(res.body).to.eql({
						errorId: 1020,
						error: 'E-mail address already taken',
						details: 'The e-mail address you selected is already in use. Please select a unique address or ' +
							'if you already have an account, try reseting your password.'
					});
					done();
				})
				.catch(done);
		});

	});

});
