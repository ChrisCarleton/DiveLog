import { app } from '../../service/server';
import Bluebird from 'bluebird';
import { createUser, purgeTable } from '../test-utils';
import DiveLogs from '../../service/data/dive-logs.table';
import { expect } from 'chai';
import geolib from 'geolib';
import supertest from 'supertest';
import Users from '../../service/data/users.table';

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

});
