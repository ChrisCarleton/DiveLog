import { app } from '../../service/server';
import bcrypt from 'bcrypt';
import { expect } from 'chai';
import faker from 'faker';
import generator from '../generator';
import { purgeTable } from '../test-utils';
import supertest from 'supertest';
import Users from '../../service/data/users.table';

const request = supertest(app);

const purgeUserTable = done => {
	purgeTable(Users, 'userId')
		.then(() => done())
		.catch(done);
};

const testValidation = (route, data, expectedErr, done) => {
	request
		.post(route)
		.send(data)
		.expect('Content-Type', /json/)
		.expect(400)
		.then(res => {
			expect(res.body.errorId).to.eql(expectedErr);
			done();
		})
		.catch(done);
};

const USERS_ROUTE = '/api/users/';

describe('User routes:', () => {

	describe('create user:', () => {

		const password = 'j0esP@ssw0rd';
		let testUser;

		before(purgeUserTable);
		afterEach(purgeUserTable);

		beforeEach(() => {
			testUser = {
				userName: faker.internet.userName(),
				email: faker.internet.email(),
				password: password,
				displayName: faker.name.findName()
			};
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
					expect(result.userName).to.equal(testUser.userName.toLowerCase());
					expect(result.displayName).to.equal(testUser.displayName);
					expect(result.passwordHash).to.not.exist;
					expect(result.email).to.equal(testUser.email);
					expect(result.role).to.equal('user');

					userId = result.userId;
					return Users.getAsync(result.userId);
				})
				.then(savedUser => {
					expect(savedUser).to.exist;
					expect(savedUser.get('userId')).to.equal(userId);
					expect(savedUser.get('userName')).to.equal(testUser.userName.toLowerCase());
					expect(savedUser.get('displayName')).to.equal(testUser.displayName);
					expect(savedUser.get('email')).to.equal(testUser.email.toLowerCase());
					expect(savedUser.get('displayEmail')).to.equal(testUser.email);
					expect(savedUser.get('role')).to.equal('user');

					const passwordHash = savedUser.get('passwordHash');
					expect(bcrypt.compareSync(testUser.password, passwordHash)).to.be.true;

					done();
				})
				.catch(done);
		});

		it('treats user names as case-insensitive', done => {
			let userId;
			testUser.userName = testUser.userName.toUpperCase();

			request
				.post(USERS_ROUTE)
				.send(testUser)
				.expect('Content-Type', /json/)
				.expect(200)
				.then(res => {
					const result = res.body;
					expect(result.userId).to.exist;
					expect(result.userName).to.equal(testUser.userName.toLowerCase());
					expect(result.displayName).to.equal(testUser.displayName);
					expect(result.passwordHash).to.not.exist;
					expect(result.email).to.equal(testUser.email);
					expect(result.role).to.equal('user');

					userId = result.userId;
					return Users.getAsync(result.userId);
				})
				.then(savedUser => {
					expect(savedUser).to.exist;
					expect(savedUser.get('userId')).to.equal(userId);
					expect(savedUser.get('userName')).to.equal(testUser.userName.toLowerCase());
					expect(savedUser.get('displayName')).to.equal(testUser.displayName);
					expect(savedUser.get('email')).to.equal(testUser.email.toLowerCase());
					expect(savedUser.get('displayEmail')).to.equal(testUser.email);
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

					return request
						.get('/api/user/')
						.set('cookie', res.headers['set-cookie'])
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					const result = res.body;
					expect(result.userId).to.exist;
					expect(result.userName).to.equal(testUser.userName.toLowerCase());
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
				1000,
				done);
		});

		it('user is rejected if user name is invalid', done => {
			testUser.userName = '@@ NOtl Va!!lid atALL';
			testValidation(
				USERS_ROUTE,
				testUser,
				1000,
				done);
		});

		it('user is rejected if email is missing', done => {
			testUser.email = undefined;
			testValidation(
				USERS_ROUTE,
				testUser,
				1000,
				done);
		});

		it('user is rejected if email is invalid', done => {
			testUser.email = 'this is not an e-mail address';
			testValidation(
				USERS_ROUTE,
				testUser,
				1000,
				done);
		});

		it('user is rejected password is missing', done => {
			testUser.password = undefined;
			testValidation(
				USERS_ROUTE,
				testUser,
				1000,
				done);
		});

		it('user is rejected if password is weak', done => {
			testUser.password = 'TooWeak';
			testValidation(
				USERS_ROUTE,
				testUser,
				1000,
				done);
		});

		it('user is rejected if display name is too long', done => {
			testUser.displayName = faker.lorem.paragraph(3);
			testValidation(
				USERS_ROUTE,
				testUser,
				1000,
				done);
		});

		it('user creation is rejected if user name is taken', done => {
			const userEntity = generator.generateUser();
			userEntity.userName = testUser.userName.toLowerCase();

			Users.createAsync(userEntity)
				.then(() => {
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
			const userEntity = generator.generateUser();
			userEntity.email = testUser.email.toLowerCase();
			userEntity.displayEmail = testUser.email;

			Users.createAsync(userEntity)
				.then(() => {
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
