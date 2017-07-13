import DiveLogs from '../../service/data/dive-logs.table';
import { expect } from 'chai';
import generator from '../generator';
import geolib from 'geolib';
import Users from '../../service/data/users.table';
import uuid from 'uuid/v4';

import {
	doCreateLog,
	doDeleteLog,
	doGetLog,
	doUpdateLog
} from '../../service/controllers/helpers/dive-logs-helpers';

describe('Dive log helpers', () => {

	let logOwner;

	before(done => {
		Users
			.createAsync({
				userName: 'DiverJoe',
				passwordHash: '333',
				email: 'joediver@diverjoe.mx'
			})
			.then(result => {
				logOwner = result.attrs;
				done();
			});
	});

	let testLog;
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

	describe('doCreateLog method', () => {

		it('will save a new dive log', done => {
			doCreateLog(logOwner, testLog)
				.then(res => {
					expect(res.logId).to.exist;
					expect(res.createdAt).to.exist;

					const expected = Object.assign(
						{},
						testLog,
						{ logId: res.logId, createdAt: res.createdAt, ownerId: logOwner.userId });

					expect(res).to.eql(expected);
					done();
				})
				.catch(done);
		});

		it('will fail if log is invalid', done => {
			testLog.depth.max = 'fifty-five';
			doCreateLog(logOwner, testLog)
				.then(() => {
					done('should not have succeeded');
				})
				.catch(err => {
					expect(err.name).to.equal('ValidationError');
					done();
				});
		});

		it('will fail if user attempts to set the log ID', done => {
			testLog.logId = uuid();
			doCreateLog(logOwner, testLog)
				.then(() => {
					done('should not have succeeded');
				})
				.catch(err => {
					expect(err.name).to.equal('ForbiddenActionError');
					done();
				});
		});

		it('will fail if user attempts to set the owner ID', done => {
			testLog.ownerId = uuid();
			doCreateLog(logOwner, testLog)
				.then(() => {
					done('should not have succeeded');
				})
				.catch(err => {
					expect(err.name).to.equal('ForbiddenActionError');
					done();
				});
		});
	});

	describe('doGetLog method', () => {

		it('will return the log entry if successful', done => {
			testLog.ownerId = logOwner.userId;
			DiveLogs.createAsync(testLog)
				.then(result => {
					return doGetLog(result.get('logId'));
				})
				.then(result => {
					const expected = Object.assign(
						{},
						testLog,
						{
							createdAt: result.createdAt,
							logId: result.logId
						});
					expect(result).to.eql(expected);
					done();
				})
				.catch(done);
		});

		it('will return null if the log entry cannot be found', done => {
			doGetLog(uuid())
				.then(result => {
					expect(result).to.be.null;
					done();
				})
				.catch(done);
		});

	});

	describe('doDeleteLog method', () => {
		it('will delete a log entry', done => {
			testLog.ownerId = logOwner.userId;
			let logId;
			DiveLogs.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					return doDeleteLog(logId);
				})
				.then(() => {
					return DiveLogs.getAsync(logId);
				})
				.then(result => {
					expect(result).to.be.null;
					done();
				})
				.catch(done);
		});

		it('will treat a non-existent log entry as a no-op', done => {
			doDeleteLog(uuid())
				.then(() => done())
				.catch(done);
		});
	});

	describe('doUpdateLog method', () => {

		it('will update the log entry', done => {
			const newValue = generator.generateDiveLogEntry(logOwner.userId);
			let logId;

			testLog.ownerId = logOwner.userId;
			DiveLogs.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					newValue.logId = logId;

					return doUpdateLog(logOwner, logId, newValue);
				})
				.then(result => {
					newValue.createdAt = result.createdAt;
					expect(result).to.eql(newValue);
					return DiveLogs.getAsync(logId);
				})
				.then(result => {
					expect(result.attrs).to.eql(newValue);
					done();
				})
				.catch(done);
		});

		it('will fail if validation fails', done => {
			const newValue = generator.generateDiveLogEntry(logOwner.userId);
			let logId;

			testLog.ownerId = logOwner.userId;
			DiveLogs.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					newValue.logId = logId;
					newValue.exposure.body = 'bikini';
					newValue.weight.amount = 'not much';

					return doUpdateLog(logOwner, logId, newValue);
				})
				.then(() => {
					done('should not have succeeded');
				})
				.catch(err => {
					expect(err.name).to.equal('ValidationError');
					done();
				});
		});

		it('will not overwrite "createdAt" and "updatedAt" values', done => {
			const newValue = generator.generateDiveLogEntry(logOwner.userId);
			const fakeCreatedAt = '2011-01-18T13:56:00.000Z';
			const fakeUpdatedAt = '2012-04-06T04:09:00.000Z';
			let logId;

			testLog.ownerId = logOwner.userId;
			DiveLogs.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					newValue.logId = logId;
					newValue.createdAt = fakeCreatedAt;
					newValue.updatedAt = fakeUpdatedAt;

					return doUpdateLog(logOwner, logId, newValue);
				})
				.then(result => {
					expect(result.createdAt).to.not.equal(fakeCreatedAt);
					expect(result.updatedAt).to.not.equal(fakeUpdatedAt);
					done();
				})
				.catch(done);
		});

		it('will fail if the user attempts to delete a required field', done => {
			const newValue = generator.generateDiveLogEntry(logOwner.userId);
			let logId;

			testLog.ownerId = logOwner.userId;
			DiveLogs.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					newValue.location = null;

					return doUpdateLog(logOwner, logId, newValue);
				})
				.then(() => {
					done('should not have succeeded');
				})
				.catch(err => {
					expect(err.name).to.equal('ValidationError');
					done();
				});
		});

		it('will fail if the user attempts to change the owner ID', done => {
			const newValue = generator.generateDiveLogEntry(logOwner.userId);
			let logId;

			testLog.ownerId = logOwner.userId;
			DiveLogs.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					newValue.logId = logId;
					newValue.ownerId = uuid();

					return doUpdateLog(logOwner, logId, newValue);
				})
				.then(() => {
					done('should not have succeeded');
				})
				.catch(err => {
					expect(err.name).to.equal('ForbiddenActionError');
					done();
				});
		});

		it('will fail if the user attempts to change the log ID', done => {
			const newValue = generator.generateDiveLogEntry(logOwner.userId);
			let logId;

			testLog.ownerId = logOwner.userId;
			DiveLogs.createAsync(testLog)
				.then(result => {
					logId = result.get('logId');
					newValue.logId = uuid();

					return doUpdateLog(logOwner, logId, newValue);
				})
				.then(() => {
					done('should not have succeeded');
				})
				.catch(err => {
					expect(err.name).to.equal('ForbiddenActionError');
					done();
				});
		});

	});
});
