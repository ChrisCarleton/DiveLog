import { app } from '../../service/server';
import Bluebird from 'bluebird';
import { createUser, purgeTable } from '../test-utils';
import DiveLogs from '../../service/data/dive-logs.table';
import { expect } from 'chai';
import generator from '../generator';
import geolib from 'geolib';
import supertest from 'supertest';
import Users from '../../service/data/users.table';
import uuid from 'uuid/v4';

const request = supertest(app);

describe('Dive log routes:', () => {

	let user1, user2, adminUser, testLog;

	function loginUser1() {
		return request
			.post('/api/auth/login/')
			.send({
				username: 'BoltSnap',
				password: 'TehB0ltW3rd'
			})
			.expect(200)
			.then(res => {
				return res.headers['set-cookie'];
			});
	}

	function loginAdmin() {
		return request
			.post('/api/auth/login/')
			.send({
				username: 'SeriousAdmin',
				password: 'B!gAdm!nP@ssW0rd'
			})
			.expect(200)
			.then(res => {
				return res.headers['set-cookie'];
			});		
	}

	before(done => {
		Bluebird
			.all([
				createUser('BoltSnap', 'jimmy1@yehaa.com', 'TehB0ltW3rd'),
				createUser('UnderTow', 'ut@geemail.com', 'W@tW@tS0n!'),
				createUser('SeriousAdmin', 'admin@thesite.com', 'B!gAdm!nP@ssW0rd', true)
			])
			.spread((u1, u2, admin) => {
				user1 = u1;
				user2 = u2;
				adminUser = admin;
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
		testLog = {
			entryTime: '2017-02-01T20:26:00.000Z',
			diveNumber: 40,
			diveTime: {
				exitTime: '2017-02-01T21:16:00.000Z',
				surfaceInterval: 53,
				bottomTime: 45,
				decoStops: [
					{
						depth: 15,
						duration: 3
					}
				]
			},
			location: 'Cozumel, MX',
			site: 'Paso de Cedral',
			gps: {
				latitude: geolib.useDecimal('20° 21\' 15.420" N'),
				longitude: geolib.useDecimal('87° 1\' 41.760" W')
			},
			cnsO2Percent: 20,
			cylinders: [
				{
					gas: {
						o2Percent: 31,
						startPressure: 2900,
						endPressure: 1000
					},
					volume: 80,
					type: 'aluminum',
					number: 1
				}
			],
			depth: {
				average: 38,
				max: 55
			},
			temperature: {
				surface: 90,
				water: 81
			},
			exposure: {
				body: 'full',
				thickness: 3,
				boots: true
			},
			equipment: {
				computer: true,
				light: true,
				surfaceMarker: true
			},
			diveType: {
				boat: true,
				drift: true,
				reef: true,
				saltWater: true
			},
			visibility: 101,
			current: 90,
			surfaceConditions: 'calm',
			mood: 'great',
			weight: {
				amount: 16,
				correctness: 'good',
				trim: 'good'
			},
			notes: 'Amazing dive!!'
		};
	});

	describe('allow edit middleware', () => {
		it('returns 404 if user name does not exist', done => {
			loginUser1()
				.then(cookie => {
					return request
						.post('/api/logs/NotAUser/')
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

		it('returns 401 if user is unauthenticated', done => {
			request
				.post(`/api/logs/${user2.userName}/`)
				.send(testLog)
				.expect('Content-Type', /json/)
				.expect(401)
				.then(res => {
					expect(res.body.errorId).to.equal(3100);
					done();
				})
				.catch(done);
		});

		it('returns 401 if trying to create a log under another user\'s profile', done => {
			loginUser1()
				.then(cookie => {
					return request
						.post(`/api/logs/${user2.userName}/`)
						.send(testLog)
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

		it('will allow admins to create entries under other users\' accounts', done => {
			loginAdmin()
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
					expect(res.body.errorId).to.equal(2100)
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

});