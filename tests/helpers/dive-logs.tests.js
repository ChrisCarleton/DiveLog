import { expect } from 'chai';
import geolib from 'geolib';
import Users from '../../service/data/users.table';
import uuid from 'uuid/v4';

import {
	doCreateLog
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

	describe('doCreateLog method', () => {

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

});
