import { app } from '../../service/server';
import { expect } from 'chai';
import request from 'supertest';

describe('User routes', () => {

	describe('create user', () => {

		let testUser = {
			userName: 'JoeTesterson',

		};

		it('users can be created', done => {
			request(app)
				.post('/api/users/')
				.send(testUser)
				.expect('Content-Type', /json/)
				.expect(200)
				.then(res => {
					
					const result = JSON.parse(res.text);
					expect(result.userId).to.exist;
					expect(result.userName).to.equal(testUser.userName);
					expect(result.displayName).to.equal(testUser.displayName);
					expect(result.passwordHash).to.not.exist;
					expect(result.email).to.equal(testUser.email);

					// TODO: Check the database!
					done();
				})
				.catch(done);
		});

		it('creating an account logs in the new user', done => {
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
