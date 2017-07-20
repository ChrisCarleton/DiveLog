import _ from 'lodash';
import Bluebird from 'bluebird';
import DiveLogs from '../../service/data/dive-logs.table';
import { expect } from 'chai';
import generator from '../generator';
import { purgeTable } from '../test-utils';
import Users from '../../service/data/users.table';
import uuid from 'uuid/v4';

import {
	doCreateLog,
	doDeleteLog,
	doGetLog,
	doListLogs,
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
		testLog = generator.generateDiveLogEntry();
		testLog.ownerId = undefined;
	});

	after(done => {
		Bluebird.all([
				purgeTable(Users, 'userId'),
				purgeTable(DiveLogs, 'logId')
			])
			.then(() => done())
			.catch(done);
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

	describe('doListLogs method', () => {
		let records = [];

		before(done => {
			for (let i = 0; i < 220; i++) {
				records.push(generator.generateDiveLogEntry(logOwner.userId));
			}

			purgeTable(DiveLogs, 'logId')
				.then(() => {
					return DiveLogs.createAsync(records);
				})
				.then(() => {
					records = _.orderBy(
						_.map(records, rec => {
							return _.pick(rec, [
								'ownerId',
								'entryTime',
								'logId',
								'diveNumber',
								'location',
								'site',
								'depth']);
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

		it('will retrieve records correctly and in reverse chronological order', done => {
			doListLogs(logOwner.userId)
				.then(results => {
					for(let i = 0; i < results.length; i++) {
						records[i].logId = results[i].logId;
						expect(results[i]).to.eql(records[i]);
					}
					done();
				})
				.catch(done);
		});

		it('will return an empty array if no records are found', done => {
			doListLogs(uuid())
				.then(results => {
					expect(results).to.be.empty;
					done();
				})
				.catch(done);
		});

		it('will retrieve 100 records by default', done => {
			doListLogs(logOwner.userId)
				.then(results => {
					expect(results).to.have.length(100);
					done();
				})
				.catch(done);
		});

		it('will retrieve more results if requested', done => {
			doListLogs(logOwner.userId, { before: records[99].entryTime })
				.then(results => {
					for(let i = 0; i < results.length; i++) {
						records[100 + i].logId = results[i].logId;
						expect(results[i]).to.eql(records[100 + i]);
					}
					done();
				})
				.catch(done);
		});

		it('will return 400 if both before and after parameters are supplied', done => {
			doListLogs(logOwner.userId, {
					after: records[99].entryTime,
					before: records[200].entryTime
				})
				.then(() => {
					done('should not have succeeded');
				})
				.catch(err => {
					expect(err.name).to.equal('ValidationError');
					done();
				});
		});

		it('will retrieve more results if requested in ascending order', done => {
			doListLogs(logOwner.userId, { order: 'asc', after: records[records.length - 100].entryTime })
				.then(results => {
					for(let i = 0; i < results.length; i++) {
						records[records.length - 101 - i].logId = results[i].logId;
						expect(results[i]).to.eql(records[records.length - 101 - i]);
					}

					done();
				})
				.catch(done);
		});

		it('will retrieve fewer records if there are no more to display', done => {
			doListLogs(logOwner.userId, { before: records[199].entryTime })
				.then(results => {
					expect(results).to.have.length(20);
					done();
				})
				.catch(done);
		});

		it('will retrieve records in chronological order if requested', done => {
			doListLogs(logOwner.userId, { order: 'asc' })
				.then(results => {
					for(let i = 0; i < results.length; i++) {
						records[records.length - 1 - i].logId = results[i].logId;
						expect(results[i]).to.eql(records[records.length - 1 - i]);
					}
					done();
				})
				.catch(done);
		});

		it('will retrieve the desired number of records', done => {
			const expectedCount = 55;

			doListLogs(logOwner.userId, { limit: expectedCount })
				.then(results => {
					expect(results).to.have.length(expectedCount);
					done();
				})
				.catch(done);
		});
	});
});
