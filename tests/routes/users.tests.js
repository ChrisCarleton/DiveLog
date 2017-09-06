import _ from 'lodash';
import { app } from '../../service/server';
import bcrypt from 'bcrypt';
import Bluebird from 'bluebird';
import { expect } from 'chai';
import faker from 'faker';
import generator from '../generator';
import { purgeTable } from '../test-utils';
import { sanitizeUserInfo } from '../../service/controllers/helpers/users-helpers';
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
			expect(res.body.errorId).to.eql(expectedErr);
			done();
		})
		.catch(done);
};

const USERS_ROUTE = '/api/users/';

describe('User routes:', () => {

	const cookies = {};
	const password = 'W@tW@tS0n!';
	let user1, user2, adminUser;

	function loginUser(user) {
		if (cookies[user.userName]) {
			return Bluebird.resolve(cookies[user.userName]);
		}

		return request
			.post('/api/auth/login/')
			.send({
				username: user.userName,
				password: password
			})
			.expect(200)
			.then(res => {
				cookies[user.userName] = res.headers['set-cookie'];
				return cookies[user.userName];
			});
	}

	function loginUser1() {
		return loginUser(user1);
	}

	function loginAdmin() {
		return loginUser(adminUser);
	}

	before(done => {
		user1 = generator.generateUser(password);
		user2 = generator.generateUser(password);
		adminUser = generator.generateUser(password);
		adminUser.role = 'admin';

		Bluebird
			.all([
				Users.createAsync(user1),
				Users.createAsync(user2),
				Users.createAsync(adminUser)
			])
			.spread((u1, u2, a) => {
				user1.userId = u1.get('userId');
				user2.userId = u2.get('userId');
				adminUser.userId = a.get('userId');
				done();
			})
			.catch(done);
	});

	after(done => {
		purgeTable(Users, 'userId')
			.then(() => done())
			.catch(done);
	});

	describe('create user:', () => {

		const password = 'j0esP@ssw0rd';
		let testUser;

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
			testUser.displayName = faker.lorem.paragraph(7);
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

	describe('Get profile:', () => {
		it('will return a user\'s profile', done => {
			loginUser1()
				.then(cookie => {
					return request
						.get(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.expect(200);
				})
				.then(res => {
					user1.createdAt = res.body.createdAt;
					expect(res.body).to.eql(sanitizeUserInfo(user1));
					done();
				})
				.catch(done);
		});

		it('will return 401 if user is unauthenticated', done => {
			request
				.get(`/api/users/${user1.userName}`)
				.expect(401)
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will return 401 if user does not have access to view the profile', done => {
			loginUser1()
				.then(cookie => {
					return request
						.get(`/api/users/${user2.userName}`)
						.set('cookie', cookie)
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will allow admins to view other user\'s profiles', done => {
			loginAdmin()
				.then(cookie => {
					return request
						.get(`/api/users/${user2.userName}`)
						.set('cookie', cookie)
						.expect(200);
				})
				.then(res => {
					user2.createdAt = res.body.createdAt;
					expect(res.body).to.eql(sanitizeUserInfo(user2));
					done();
				})
				.catch(done);
		});

		it('will return 404 if an admin tries to view a profile that does not exist', done => {
			loginAdmin()
				.then(cookie => {
					return request
						.get('/api/users/MadeUpUser')
						.set('cookie', cookie)
						.expect(404);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(2100);
					done();
				})
				.catch(done);
		});

	});

	describe('Update profile:', () => {

		let newInfo;
		const profileFields
			= ['displayName', 'location', 'certificationAgencies', 'diverType', 'numberOfDives'];
		beforeEach(done => {
			newInfo = {
				displayName: 'Best User',
				location: 'London, UK',
				certificationAgencies: 'PADI, BSAC',
				diverType: 'typical',
				numberOfDives: '<500'
			};

			Users.updateAsync(
				_.pick(
					user1,
					_.concat(profileFields, ['userId', 'email', 'displayEmail'])))
				.then(() => done())
				.catch(done);
		});

		after(done => {
			Users.updateAsync(
				_.pick(
					user1,
					_.concat(profileFields, ['userId', 'email', 'displayEmail'])))
				.then(() => done())
				.catch(done);
		});

		it('will update a user\'s profile', done => {
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(200);
				})
				.then(res => {
					expect(res.body.email).to.equal(user1.displayEmail);
					expect(_.pick(res.body, profileFields)).to.eql(newInfo);
					return Users.getAsync(user1.userId);
				})
				.then(res => {
					expect(res.get('displayEmail')).to.equal(user1.displayEmail);
					expect(res.get('email')).to.equal(user1.email);
					expect(_.pick(res.attrs, profileFields)).to.eql(newInfo);
					done();
				})
				.catch(done);
		});

		it('will change a user\'s email address', done => {
			const expectedEmail = faker.internet.email();
			newInfo.email = expectedEmail;
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(200);
				})
				.then(res => {
					delete newInfo.email;
					expect(res.body.email).to.equal(expectedEmail);
					expect(_.pick(res.body, profileFields)).to.eql(newInfo);
					return Users.getAsync(user1.userId);
				})
				.then(res => {
					expect(res.get('displayEmail')).to.equal(expectedEmail);
					expect(res.get('email')).to.equal(expectedEmail.toLowerCase());

					expect(_.pick(res.attrs, profileFields)).to.eql(newInfo);
					done();
				})
				.catch(done);
		});

		it('will allow users to remove fields', done => {
			newInfo = {
				displayName: null,
				location: null,
				certificationAgencies: null,
				diverType: null,
				numberOfDives: null
			};

			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(200);
				})
				.then(res => {
					expect(res.body.email).to.equal(user1.displayEmail);
					expect(_.pick(res.body, profileFields)).to.be.empty;
					return Users.getAsync(user1.userId);
				})
				.then(res => {
					expect(_.pick(res.attrs, profileFields)).to.be.empty;
					done();
				})
				.catch(done);
		});

		it('will return 400 if email is invalid', done => {
			newInfo.email = 'not valid';
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(400);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 403 if email is already taken', done => {
			newInfo.email = user2.displayEmail;
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(403);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3200);
					done();
				})
				.catch(done);
		});

		it('will return 403 if user attempts to remove their e-mail address', done => {
			newInfo.email = null;
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(403);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3200);
					done();
				})
				.catch(done);
		});

		it('will return 400 if location is too long', done => {
			newInfo.location = faker.lorem.paragraph(7);
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(400);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 400 if display name is too long', done => {
			newInfo.displayName = faker.lorem.paragraph(7);
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(400);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 400 if date of birth is not a valid ISO date', done => {
			newInfo.dateOfBirth = 'lol. not a date.';
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(400);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 400 if certification agencies is too long', done => {
			newInfo.certificationAgencies = faker.lorem.paragraph(7);
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(400);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 400 if diver type is not valid', done => {
			newInfo.diverType = 'exceptional';
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(400);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 400 if number of dives is not valid', done => {
			newInfo.numberOfDives = '42';
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(400);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 400 if an unvalidated field is provided in the request body', done => {
			newInfo.likesBoats = true;
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(400);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 401 if profile does not exist', done => {
			loginUser1()
				.then(cookie => {
					return request
						.put('/api/users/MadeUpUser')
						.set('cookie', cookie)
						.send(newInfo)
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will return 401 if user is unauthenticated', done => {
			request
				.put(`/api/users/${user1.userName}`)
				.send(newInfo)
				.expect(401)
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will return 401 if user attempts to update another user\'s profile', done => {
			loginUser1()
				.then(cookie => {
					return request
						.put(`/api/users/${user2.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will allow admins to update other user\'s profiles', done => {
			loginAdmin()
				.then(cookie => {
					return request
						.put(`/api/users/${user1.userName}`)
						.set('cookie', cookie)
						.send(newInfo)
						.expect(200);
				})
				.then(res => {
					expect(res.body.email).to.equal(user1.displayEmail);
					expect(_.pick(res.body, profileFields)).to.eql(newInfo);
					return Users.getAsync(user1.userId);
				})
				.then(res => {
					expect(_.pick(res.attrs, profileFields)).to.eql(newInfo);
					done();
				})
				.catch(done);
		});

		it('will return 404 if an admin attempts to update a profile that does not exist', done => {
			loginAdmin()
				.then(cookie => {
					return request
						.put('/api/users/MadeUpUser')
						.set('cookie', cookie)
						.send(newInfo)
						.expect(404);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(2100);
					done();
				})
				.catch(done);
		});
	});

});
