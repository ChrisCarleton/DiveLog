import { app } from '../../service/server';
import bcrypt from 'bcrypt';
import Bluebird from 'bluebird';
import db from '../../service/data/database';
import { expect } from 'chai';
import log from '../../service/logger';
import supertest from 'supertest';
import Users from '../../service/data/users.table';

const request = supertest(app);

describe('User routes', () => {

	describe('create user', () => {

		const password = 'j0esP@ssw0rd';
		let idsToDestroy = [];
		let testUser;

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
				.post('/api/users/')
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
			let userId;

			request
				.post('/api/users/')
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

		it('user creation is rejected if password and confirmation do not match', done => {
			done();
		});

		it('user creation is rejected if parameters are invalid', done => {
			done();
		});

		it('user creation is rejected if user name is taken', done => {
			done();
		});

		it('user creation is rejected if email address is taken', done => {
			done();
		});

	});

});
