import { expect } from 'chai';
import faker from 'faker';
import generator from '../generator';
import Joi from 'joi';

import { createSchema, updateSchema } from '../../service/data/dive-logs.table';

const assertFails = entry => {
	const updateValidation = Joi.validate(entry, updateSchema);

	entry.logId = undefined;
	const createValidation = Joi.validate(entry, createSchema);

	expect(createValidation.error).to.exist;
	expect(updateValidation.error).to.exist;
};

const assertFailsCreate = entry => {
	const createValidation = Joi.validate(entry, createSchema);
	expect(createValidation.error).to.exist;
};

const assertFailsUpdate = entry => {
	const updateValidation = Joi.validate(entry, updateSchema);
	expect(updateValidation.error).to.exist;
};

const assertPasses = entry => {
	const updateValidation = Joi.validate(entry, updateSchema);

	entry.logId = undefined;
	const createValidation = Joi.validate(entry, createSchema);

	expect(createValidation.error).to.not.exist;
	expect(updateValidation.error).to.not.exist;
};

describe('Dive logs table validation:', () => {

	let entry;
	beforeEach(() => {
		entry = generator.generateDiveLogEntry();
		entry.logId = faker.random.uuid();
	});

	it('passes if all is well', () => {
		assertPasses(entry);
	});

	it('log ID must be a UUID', () => {
		entry.logId = 'not valid';
		assertFailsCreate(entry);
		assertFailsUpdate(entry);
	});

	it('owner ID is required', () => {
		entry.ownerId = undefined;
		assertFails(entry);
	});

	it('owner ID must be a UUID', () => {
		entry.ownerId = 'not-a-uuid';
		assertFails(entry);
	});

	it('entry time is required', () => {
		entry.entryTime = undefined;
		assertFails(entry);
	});

	it('entry time must be an ISO date', () => {
		entry.entryTime = 'Jan 4 2014 9:30am';
		assertFails(entry);
	});

	it('dive number must be an integer', () => {
		entry.diveNumber = 33.29;
		assertFails(entry);
	});

	it('dive number must be positive', () => {
		entry.diveNumber = 0;
		assertFails(entry);

		entry.diveNumber = -3;
		assertFails(entry);
	});

	it('dive length is required', () => {
		entry.diveTime.diveLength = null;
		assertFails(entry);

		entry.diveTime.diveLength = undefined;
		assertFails(entry);
	});

	it('dive length must be an integer', () => {
		entry.diveTime.diveLength = 33.29;
		assertFails(entry);
	});

	it('dive length must be positive', () => {
		entry.diveTime.diveLength = 0;
		assertFails(entry);

		entry.diveTime.diveLength = -3;
		assertFails(entry);
	});

	it('surface interval must be an integer', () => {
		entry.diveTime.surfaceInterval = 33.29;
		assertFails(entry);
	});

	it('surface interval must be positive', () => {
		entry.diveTime.surfaceInterval = 0;
		assertFails(entry);

		entry.diveTime.surfaceInterval = -3;
		assertFails(entry);
	});

	it('surface interval is not required', () => {
		entry.diveTime.surfaceInterval = undefined;
		assertPasses(entry);
	});

	it('bottom time must be an integer', () => {
		entry.diveTime.bottomTime = 33.29;
		assertFails(entry);
	});

	it('bottom time must be positive', () => {
		entry.diveTime.bottomTime = 0;
		assertFails(entry);

		entry.diveTime.bottomTime = -3;
		assertFails(entry);
	});

	it('bottom time is not required', () => {
		entry.diveTime.bottomTime = undefined;
		assertPasses(entry);
	});

	describe('deco stops:', () => {
		it('deco stops is not required', () => {
			entry.diveTime.decoStops = undefined;
			assertPasses(entry);
		});

		it('no more than 10 deco stops can be entered', () => {
			let decoStops = [];
			for (let i = 0; i < 11; i++) {
				decoStops.push({
					depth: faker.random.number({ min: 1, max: 100 }),
					duration: faker.random.number({ min: 3, max: 20 })
				});
			}
			entry.diveTime.decoStops = decoStops;
			assertFails(entry);
		});

		it('up to 10 deco stops can be entered', () => {
			let decoStops = [];
			for (let i = 0; i < 10; i++) {
				decoStops.push({
					depth: faker.random.number({ min: 1, max: 100 }),
					duration: faker.random.number({ min: 3, max: 20 })
				});
			}
			entry.diveTime.decoStops = decoStops;
			assertPasses(entry);
		});

		it('depth must be a number', () => {
			entry.diveTime.decoStops[0].depth = 'thirty three';
			assertFails(entry);
		});

		it('depth must be positive', () => {
			entry.diveTime.decoStops[0].depth = 0.0;
			assertFails(entry);

			entry.diveTime.decoStops[0].depth = -3.3;
			assertFails(entry);
		});

		it('depth can be fractional', () => {
			entry.diveTime.decoStops[0].depth = 7.75;
			assertPasses(entry);
		});

		it('depth is not required', () => {
			entry.diveTime.decoStops[0].depth = undefined;
			assertPasses(entry);
		});

		it('duration must be a number', () => {
			entry.diveTime.decoStops[0].duration = 'thirty three';
			assertFails(entry);
		});

		it('duration must be positive', () => {
			entry.diveTime.decoStops[0].duration = 0.0;
			assertFails(entry);

			entry.diveTime.decoStops[0].duration = -3.3;
			assertFails(entry);
		});

		it('duration can be fractional', () => {
			entry.diveTime.decoStops[0].duration = 7.75;
			assertPasses(entry);
		});

		it('duration is not required', () => {
			entry.diveTime.decoStops[0].duration = undefined;
			assertPasses(entry);
		});

	});

	it('location is required', () => {
		entry.location = undefined;
		assertFails(entry);
	});

	it('location can be any string', () => {
		entry.location = faker.lorem.sentence(6);
		assertPasses(entry);
	});

	it('location can be no longer than 250 characters', () => {
		entry.location = faker.lorem.paragraphs(7);
		assertFails(entry);
	});

	it('site is required', () => {
		entry.site = undefined;
		assertFails(entry);
	});

	it('site can be any string', () => {
		entry.site = faker.lorem.sentence(6);
		assertPasses(entry);
	});

	it('site can be no longer than 250 characters', () => {
		entry.site = faker.lorem.paragraphs(7);
		assertFails(entry);
	});

	describe('gps:', () => {
		it('is not required', () => {
			entry.gps = undefined;
			assertPasses(entry);
		});

		it('latitude is not required', () => {
			entry.gps.latitude = undefined;
			assertPasses(entry);
		});

		it('longitude is not required', () => {
			entry.gps.longitude = undefined;
			assertPasses(entry);
		});
	});

	it('cns O2 percent is not required', () => {
		entry.cnsO2Percent = undefined;
		assertPasses(entry);
	});

	it('cns O2 percent must be a number', () => {
		entry.cnsO2Percent = '23%';
		assertFails(entry);
	});

	it('cns O2 percent can be no less than zero', () => {
		entry.cnsO2Percent = -1.2;
		assertFails(entry);
	});

	it('cns O2 percent can be no more than 150', () => {
		entry.cnsO2Percent = 150.3;
		assertFails(entry);
	});
});
