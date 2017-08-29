import _ from 'lodash';
import { app } from '../../service/server';
import Bluebird from 'bluebird';
import { purgeTable } from '../test-utils';
import DiveLogs from '../../service/data/dive-logs.table';
import { expect } from 'chai';
import generator from '../generator';
import supertest from 'supertest';
import Users from '../../service/data/users.table';
import uuid from 'uuid/v4';

const request = supertest(app);

describe('Dive log routes:', () => {

	const cookies = {};
	const password = 'W@tW@tS0n!';
	let user1, user2, adminUser, testLog;

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
		Bluebird.all([
			purgeTable(Users, 'userId'),
			purgeTable(DiveLogs, 'logId')])
			.then(() => done())
			.catch(done);
	});

	beforeEach(() => {
		testLog = generator.generateDiveLogEntry();
		testLog.ownerId = undefined;
	});

	describe('create log route', () => {

		it('will successfully return newly-created log entries', done => {
			loginUser1()
				.then(cookie => {
					return request
						.post(`/api/logs/${user1.userName}/`)
						.send(testLog)
						.set('cookie', cookie)
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					expect(res.body.logId).to.exist;
					expect(res.body.createdAt).to.exist;

					const expected = Object.assign(
						{},
						testLog,
						{
							logId: res.body.logId,
							ownerId: user1.userId,
							createdAt: res.body.createdAt
						});
					expect(res.body).to.eql(expected);
					done();
				})
				.catch(done);
		});

		it('will return 400 if log entry is invalid', done => {
			testLog.weight.amount = 'a lot';

			loginUser1()
				.then(cookie => {
					return request
						.post(`/api/logs/${user1.userName}/`)
						.send(testLog)
						.set('cookie', cookie)
						.expect('Content-Type', /json/)
						.expect(400);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 403 if user attempts something illegal (like setting the owner ID)', done => {
			testLog.ownerId = adminUser.userId;

			loginUser1()
				.then(cookie => {
					return request
						.post(`/api/logs/${user1.userName}/`)
						.send(testLog)
						.set('cookie', cookie)
						.expect('Content-Type', /json/)
						.expect(403);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3200);
					done();
				})
				.catch(done);
		});

		it('will return 404 if user does not exist', done => {
			loginAdmin()
				.then(cookie => {
					return request
						.post('/api/logs/NotARealUser/')
						.send(testLog)
						.set('cookie', cookie)
						.expect('Content-Type', /json/)
						.expect(404);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(2100);
					done();
				})
				.catch(done);
		});

	});

	describe('get log route', () => {

		it('will return the requested log', done => {
			let logId;
			testLog.ownerId = user1.userId;
			DiveLogs
				.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					return loginUser1();
				})
				.then(cookie => {
					return request
						.get(`/api/logs/${user1.userName}/${logId}`)
						.set('cookie', cookie)
						.expect(200);
				})
				.then(res => {
					const expected = Object.assign(
						{},
						testLog,
						{
							createdAt: res.body.createdAt,
							logId: logId
						});
					expect(res.body).to.eql(expected);
					done();
				})
				.catch(done);
		});

		it('will return 404 if log does not exist', done => {
			loginUser1()
				.then(cookie => {
					return request
						.get(`/api/logs/${user1.userName}/${uuid()}`)
						.set('cookie', cookie)
						.expect(404);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(2100);
					done();
				})
				.catch(done);
		});

		it('will return 404 if user does not exist', done => {
			let logId;
			testLog.ownerId = user1.userId;
			DiveLogs
				.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					return loginAdmin();
				})
				.then(cookie => {
					return request
						.get(`/api/logs/NotARealUser/${logId}`)
						.set('cookie', cookie)
						.expect(404);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(2100);
					done();
				})
				.catch(done);
		});

		it('will return 401 if user does not have permission to view the log', done => {
			let logId;
			testLog.ownerId = user2.userId;
			DiveLogs
				.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					return loginUser1();
				})
				.then(cookie => {
					return request
						.get(`/api/logs/${user2.userName}/${logId}`)
						.set('cookie', cookie)
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

	});

	describe('delete log route', () => {

		it('will delete the requested log', done => {
			let logId;
			testLog.ownerId = user1.userId;
			DiveLogs
				.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					return loginUser1();
				})
				.then(cookie => {
					return request
						.delete(`/api/logs/${user1.userName}/${logId}/`)
						.set('cookie', cookie)
						.expect(200);
				})
				.then(() => {
					return DiveLogs.getAsync(logId);
				})
				.then(res => {
					expect(res).to.be.null;
					done();
				})
				.catch(done);
		});

		it('will return 404 if the log cannot be found', done => {
			loginUser1()
				.then(cookie => {
					return request
						.delete(`/api/logs/${user1.userName}/${uuid()}/`)
						.set('cookie', cookie)
						.expect(404);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(2100);
					done();
				})
				.catch(done);
		});

		it('will return 401 if deletion is not permitted', done => {
			let logId;
			testLog.ownerId = user2.userId;
			DiveLogs
				.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					return loginUser1();
				})
				.then(cookie => {
					return request
						.delete(`/api/logs/${user2.userName}/${logId}`)
						.set('cookie', cookie)
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});
	});

	describe('update log route', () => {

		it('will return 200 if successful', done => {
			const newValue = generator.generateDiveLogEntry(user1.userId);
			let logId;
			testLog.ownerId = user1.userId;
			DiveLogs
				.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					return loginUser1();
				})
				.then(cookie => {
					return request
						.put(`/api/logs/${user1.userName}/${logId}/`)
						.send(newValue)
						.set('cookie', cookie)
						.expect(200);
				})
				.then(result => {
					expect(result.body.updatedAt).to.exist;
					Object.assign(newValue, {
						logId: result.body.logId,
						createdAt: result.body.createdAt,
						updatedAt: result.body.updatedAt
					});
					expect(result.body).to.eql(newValue);
					return DiveLogs.getAsync(logId);
				})
				.then(res => {
					expect(res.attrs).to.eql(newValue);
					done();
				})
				.catch(done);
		});

		it('can do partial updates (earning it the PATCH alias!)', done => {
			const newValue = {
				cnsO2Percent: 120,
				weight: {
					amount: 46
				}
			};

			let logId, expected;
			testLog.ownerId = user1.userId;
			DiveLogs
				.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					return loginUser1();
				})
				.then(cookie => {
					return request
						.put(`/api/logs/${user1.userName}/${logId}/`)
						.send(newValue)
						.set('cookie', cookie)
						.expect(200);
				})
				.then(result => {
					expected = Object.assign({}, testLog, newValue, {
						logId: result.body.logId,
						createdAt: result.body.createdAt,
						updatedAt: result.body.updatedAt
					});
					expect(result.body).to.eql(expected);
					return DiveLogs.getAsync(logId);
				})
				.then(res => {
					expect(res.attrs).to.eql(expected);
					done();
				})
				.catch(done);
		});

		it('will return 400 if validation fails', done => {
			const newValue = generator.generateDiveLogEntry(user1.userId);
			let logId;
			testLog.ownerId = user1.userId;
			DiveLogs
				.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					return loginUser1();
				})
				.then(cookie => {
					newValue.cnsO2Percent = 'wat?';

					return request
						.put(`/api/logs/${user1.userName}/${logId}/`)
						.send(newValue)
						.set('cookie', cookie)
						.expect(400);
				})
				.then(result => {
					expect(result.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 404 if user does not exist', done => {
			const newValue = generator.generateDiveLogEntry(user1.userId);
			loginAdmin()
				.then(cookie => {
					return request
						.put(`/api/logs/NotARealUser/${uuid()}/`)
						.send(newValue)
						.set('cookie', cookie)
						.expect(404);
				})
				.then(result => {
					expect(result.body.errorId).to.equal(2100);
					done();
				})
				.catch(done);
		});

		it('will return 404 if log entry does not exist', done => {
			const newValue = generator.generateDiveLogEntry(user1.userId);
			loginAdmin()
				.then(cookie => {
					return request
						.put(`/api/logs/${user1.userName}/${uuid()}/`)
						.send(newValue)
						.set('cookie', cookie)
						.expect(404);
				})
				.then(result => {
					expect(result.body.errorId).to.equal(2100);
					done();
				})
				.catch(done);
		});

		it('will return 401 if user is not authorized to update log entry', done => {
			const newValue = generator.generateDiveLogEntry(user2.userId);
			let logId;
			testLog.ownerId = user2.userId;
			DiveLogs
				.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					return loginUser1();
				})
				.then(cookie => {
					return request
						.put(`/api/logs/${user2.userName}/${logId}/`)
						.send(newValue)
						.set('cookie', cookie)
						.expect(401);
				})
				.then(result => {
					expect(result.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will return 403 if the user attempts something illegal like changing the owner', done => {
			const newValue = generator.generateDiveLogEntry(user1.userId);
			let logId;
			testLog.ownerId = user1.userId;
			DiveLogs
				.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					return loginUser1();
				})
				.then(cookie => {
					newValue.ownerId = uuid();

					return request
						.put(`/api/logs/${user1.userName}/${logId}/`)
						.send(newValue)
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

	describe('list logs route', () => {
		let records = [];

		before(done => {
			for (let i = 0; i < 220; i++) {
				records.push(generator.generateDiveLogEntry(user1.userId));
			}

			purgeTable(DiveLogs, 'logId')
				.then(() => {
					return DiveLogs.createAsync(records);
				})
				.then(() => {
					records = _.orderBy(
						_.map(records, rec => {
							return _.pick(
								rec,
								[
									'ownerId',
									'entryTime',
									'logId',
									'diveNumber',
									'location',
									'site',
									'depth'
								]);
						}),
						['entryTime'],
						['desc']);
					done();
				})
				.catch(done);
		});

		after(done => {
			purgeTable(DiveLogs, 'logId')
				.then(() => done())
				.catch(done);
		});

		it('will retrieve a list of dive log entries', done => {
			loginUser1()
				.then(cookie => {
					return request
						.get(`/api/logs/${user1.userName}/`)
						.set('cookie', cookie)
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					expect(res.body).to.have.length(100);
					for (let i = 0; i < res.body.length; i++) {
						records[i].logId = res.body[i].logId;
						expect(res.body[i]).to.eql(records[i]);
					}
					done();
				})
				.catch(done);
		});

		it('will accept query string params to change the behaviour', done => {
			loginUser1()
				.then(cookie => {
					return request
						.get(`/api/logs/${user1.userName}/`)
						.query({
							order: 'asc',
							after: records[100].entryTime,
							limit: 20
						})
						.set('cookie', cookie)
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					expect(res.body).to.have.length(20);
					for (let i = 0; i < 20; i++) {
						records[99 - i].logId = res.body[i].logId;
						expect(res.body[i]).to.eql(records[99 - i]);
					}
					done();
				})
				.catch(done);
		});

		it('will return 400 if query string params are invalid', done => {
			loginUser1()
				.then(cookie => {
					return request
						.get(`/api/logs/${user1.userName}/`)
						.query({
							order: 'not-valid',
							limit: 20,
							wat: true
						})
						.set('cookie', cookie)
						.expect('Content-Type', /json/)
						.expect(400);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 400 if "before" and "after" params are supplied at the same time', done => {
			loginUser1()
				.then(cookie => {
					return request
						.get(`/api/logs/${user1.userName}/`)
						.query({
							before: '2017-01-01T00:00:00.000Z',
							after: '2016-01-01T00:00:00.000Z'
						})
						.set('cookie', cookie)
						.expect('Content-Type', /json/)
						.expect(400);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(1000);
					done();
				})
				.catch(done);
		});

		it('will return 401 if user is unauthenticated', done => {
			request
				.get(`/api/logs/${user1.userName}/`)
				.expect('Content-Type', /json/)
				.expect(401)
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will return 401 if user does not have permission to view log entries', done => {
			loginUser1()
				.then(cookie => {
					return request
						.get(`/api/logs/${user2.userName}/`)
						.query({
							order: 'desc',
							before: records[100].entryTime,
							limit: 500
						})
						.set('cookie', cookie)
						.expect('Content-Type', /json/)
						.expect(401);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('will return 404 if user does not exist', done => {
			loginAdmin()
				.then(cookie => {
					return request
						.get('/api/logs/NotARealUser/')
						.set('cookie', cookie)
						.expect('Content-Type', /json/)
						.expect(404);
				})
				.then(res => {
					expect(res.body.errorId).to.equal(2100);
					done();
				})
				.catch(done);
		});

		it('admins can view other users\' private logs', done => {
			loginAdmin()
				.then(cookie => {
					return request
						.get(`/api/logs/${user1.userName}/`)
						.set('cookie', cookie)
						.expect('Content-Type', /json/)
						.expect(200);
				})
				.then(res => {
					expect(res.body).to.have.length(100);
					for (let i = 0; i < res.body.length; i++) {
						records[i].logId = res.body[i].logId;
						expect(res.body[i]).to.eql(records[i]);
					}
					done();
				})
				.catch(done);
		});
	});

});
