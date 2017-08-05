import { expect } from 'chai';
import faker from 'faker';
import generator from '../generator';
import Joi from 'joi';

import { createSchema, updateSchema } from '../../service/data/dive-logs.table';

const assertFails = entry => {
	const updateValidation = Joi.validate(entry, updateSchema);

	const temp = entry.logId;
	entry.logId = undefined;
	const createValidation = Joi.validate(entry, createSchema);
	entry.logId = temp;

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

	const temp = entry.logId;
	entry.logId = undefined;
	const createValidation = Joi.validate(entry, createSchema);
	entry.logId = temp;

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

	it('log ID is forbidden on create', () => {
		assertFailsCreate(entry);
	});

	it('log ID is required on update', () => {
		entry.logId = undefined;
		assertFailsUpdate(entry);
	});

	it('log ID must be a UUID', () => {
		entry.logId = 'not valid';
		assertFailsUpdate(entry);
	});

	it('owner ID is required', () => {
		entry.ownerId = undefined;
		assertFails(entry);

		entry.ownerId = null;
		assertFails(entry);
	});

	it('owner ID must be a UUID', () => {
		entry.ownerId = 'not-a-uuid';
		assertFails(entry);
	});

	it('owner ID cannot be removed on update', () => {
		entry.ownerId = null;
		assertFailsUpdate(entry);
	});

	it('entry time is required', () => {
		entry.entryTime = undefined;
		assertFailsCreate(entry);

		entry.entryTime = null;
		assertFailsCreate(entry);
	});

	it('entry time cannot be removed on update', () => {
		entry.entryTime = null;
		assertFailsUpdate(entry);
	});

	it('entry time must be an ISO date', () => {
		entry.entryTime = 'Jan 4 2014 9:30am';
		assertFails(entry);

		entry.entryTime = '2014-01-04T09:30:00.000Z';
		assertPasses(entry);
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

	it('dive number is not required', () => {
		entry.diveNumber = undefined;
		assertPasses(entry);

		entry.diveNumber = null;
		assertPasses(entry);
	});

	it('dive time structure is required', () => {
		entry.diveTime = undefined;
		assertFailsCreate(entry);

		entry.diveTime = null;
		assertFails(entry);
	});

	it('dive time structure cannot be removed on update', () => {
		entry.diveTime = null;
		assertFailsUpdate(entry);
	});

	it('dive length is required', () => {
		entry.diveTime.diveLength = null;
		assertFailsCreate(entry);

		entry.diveTime.diveLength = undefined;
		assertFailsCreate(entry);
	});

	it('dive length cannot be removed on update', () => {
		entry.diveTime.diveLength = null;
		assertFailsUpdate(entry);
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

		entry.diveTime.surfaceInterval = null;
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

		entry.diveTime.bottomTime = null;
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

			entry.diveTime.decoStops[0].depth = null;
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

			entry.diveTime.decoStops[0].duration = null;
			assertPasses(entry);
		});

	});

	it('location is required', () => {
		entry.location = undefined;
		assertFailsCreate(entry);
	});

	it('location cannot be removed on update', () => {
		entry.location = null;
		assertFailsUpdate(entry);
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
		assertFailsCreate(entry);
	});

	it('site cannot be removed on update', () => {
		entry.site = null;
		assertFailsUpdate(entry);
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

			entry.gps = null;
			assertPasses(entry);
		});

		// TODO: Need a good way to validate this.

		it('latitude is not required', () => {
			entry.gps.latitude = undefined;
			assertPasses(entry);

			entry.gps.latitude = null;
			assertPasses(entry);
		});

		it('longitude is not required', () => {
			entry.gps.longitude = undefined;
			assertPasses(entry);

			entry.gps.longitude = null;
			assertPasses(entry);
		});
	});

	it('cns O2 percent is not required', () => {
		entry.cnsO2Percent = undefined;
		assertPasses(entry);

		entry.cnsO2Percent = null;
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

	describe('cylinders section:', () => {

		it('is optional', () => {
			entry.cylinders = undefined;
			assertPasses(entry);

			entry.cylinders = null;
			assertPasses(entry);
		});

		it('can contain up to 10 entries', () => {
			for (let i = 0; i < 9; i++) {
				entry.cylinders.push(generator.generateCylinderEntry());
			}
			assertPasses(entry);
		});

		it('can contain no more than 10 entries', () => {
			for (let i = 0; i < 10; i++) {
				entry.cylinders.push(generator.generateCylinderEntry());
			}
			assertFails(entry);
		});

		it('gas section is not required', () => {
			entry.cylinders[0].gas = undefined;
			assertPasses(entry);

			entry.cylinders[0].gas = null;
			assertPasses(entry);
		});

		it('o2 percent is not required', () => {
			entry.cylinders[0].gas.o2Percent = undefined;
			assertPasses(entry);

			entry.cylinders[0].gas.o2Percent = null;
			assertPasses(entry);
		});

		it('o2 percent must be a number', () => {
			entry.cylinders[0].gas.o2Percent = '32%';
			assertFails(entry);

			entry.cylinders[0].gas.o2Percent = 32.3;
			assertPasses(entry);
		});

		it('o2 percent must be between 1% and 100%', () => {
			entry.cylinders[0].gas.o2Percent = 0.55;
			assertFails(entry);

			entry.cylinders[0].gas.o2Percent = 100.3;
			assertFails(entry);

			entry.cylinders[0].gas.o2Percent = 1.0;
			assertPasses(entry);

			entry.cylinders[0].gas.o2Percent = 100.0;
			assertPasses(entry);
		});

		it('he percent is not required', () => {
			entry.cylinders[0].gas.hePercent = undefined;
			assertPasses(entry);

			entry.cylinders[0].gas.hePercent = null;
			assertPasses(entry);
		});

		it('he percent must be a number', () => {
			entry.cylinders[0].gas.hePercent = '32%';
			assertFails(entry);

			entry.cylinders[0].gas.hePercent = 32.3;
			assertPasses(entry);
		});

		it('he percent must be between 0% and 99%', () => {
			entry.cylinders[0].gas.hePercent = -0.55;
			assertFails(entry);

			entry.cylinders[0].gas.hePercent = 99.3;
			assertFails(entry);

			entry.cylinders[0].gas.hePercent = 0.0;
			assertPasses(entry);

			entry.cylinders[0].gas.hePercent = 99.0;
			assertPasses(entry);
		});

		it('start pressure is not required', () => {
			entry.cylinders[0].gas.startPressure = undefined;
			assertPasses(entry);

			entry.cylinders[0].gas.startPressure = null;
			assertPasses(entry);
		});

		it('start pressure must be a number', () => {
			entry.cylinders[0].gas.startPressure = 'full tank';
			assertFails(entry);

			entry.cylinders[0].gas.startPressure = 230.43;
			entry.cylinders[0].gas.endPressure = 18.04;
			assertPasses(entry);
		});

		it('start pressure must be positive', () => {
			entry.cylinders[0].gas.startPressure = 0.0;
			assertFails(entry);

			entry.cylinders[0].gas.startPressure = -300;
			assertFails(entry);
		});

		it('end pressure is not required', () => {
			entry.cylinders[0].gas.endPressure = undefined;
			assertPasses(entry);

			entry.cylinders[0].gas.endPressure = null;
			assertPasses(entry);
		});

		it('end pressure must be a number', () => {
			entry.cylinders[0].gas.endPressure = 'on reserve';
			assertFails(entry);

			entry.cylinders[0].gas.endPressure = 504.43;
			assertPasses(entry);
		});

		it('end pressure must be positive', () => {
			entry.cylinders[0].gas.endPressure = -0.1;
			assertFails(entry);

			entry.cylinders[0].gas.endPressure = -300;
			assertFails(entry);
		});

		it('end pressure must be less than start pressure', () => {
			entry.cylinders[0].gas.endPressure
				= entry.cylinders[0].gas.startPressure + 200;
			assertFails(entry);
		});

		it('volume is not required', () => {
			entry.cylinders[0].volume = undefined;
			assertPasses(entry);

			entry.cylinders[0].volume = null;
			assertPasses(entry);
		});

		it('volume must be a number', () => {
			entry.cylinders[0].volume = '80cf';
			assertFails(entry);

			entry.cylinders[0].volume = 79.9;
			assertPasses(entry);
		});

		it('volume can be no larger than 200cf', () => {
			entry.cylinders[0].volume = 201;
			assertFails(entry);
		});

		it('volume must be positive', () => {
			entry.cylinders[0].volume = 0;
			assertFails(entry);

			entry.cylinders[0].volume = -12;
			assertFails(entry);
		});

		it('type is not required', () => {
			entry.cylinders[0].type = undefined;
			assertPasses(entry);

			entry.cylinders[0].type = null;
			assertPasses(entry);
		});

		it('type may be aluminum or steel', () => {
			entry.cylinders[0].type = 'aluminum';
			assertPasses(entry);

			entry.cylinders[0].type = 'steel';
			assertPasses(entry);
		});

		it('type may not be other strings', () => {
			entry.cylinders[0].type = 'adamantium';
			assertFails(entry);
		});

		it('number is not required', () => {
			entry.cylinders[0].number = undefined;
			assertPasses(entry);

			entry.cylinders[0].number = null;
			assertPasses(entry);
		});

		it('number must be an integer', () => {
			entry.cylinders[0].number = 2.5;
			assertFails(entry);

			entry.cylinders[0].number = 'two';
			assertFails(entry);
		});

		it('number can be no less than 1', () => {
			entry.cylinders[0].number = 0;
			assertFails(entry);
		});

		it('number can be no more than 10', () => {
			entry.cylinders[0].number = 11;
			assertFails(entry);
		});
	});

	describe('depth section:', () => {

		it('is required', () => {
			entry.depth = undefined;
			assertFailsCreate(entry);

			entry.depth = null;
			assertFailsCreate(entry);
		});

		it('cannot be removed on update', () => {
			entry.depth = null;
			assertFailsUpdate(entry);
		});

		it('max depth is required', () => {
			entry.depth.max = undefined;
			assertFailsCreate(entry);

			entry.depth.max = null;
			assertFails(entry);
		});

		it('max depth must be a number', () => {
			entry.depth.average = 65;
			entry.depth.max = 80;
			assertPasses(entry);

			entry.depth.max = '60ft';
			assertFails(entry);
		});

		it('max depth must be positve', () => {
			entry.depth.average = undefined;
			entry.depth.max = 0.8;
			assertPasses(entry);

			entry.depth.max = 0.0;
			assertFails(entry);
		});

		it('max depth must be no more than 1000\'', () => {
			entry.depth.max = 1000.0;
			assertPasses(entry);

			entry.depth.max = 1001;
			assertFails(entry);
		});

		it('average depth is not required', () => {
			entry.depth.average = undefined;
			assertPasses(entry);

			entry.depth.average = null;
			assertPasses(entry);
		});

		it('average depth must be a number', () => {
			entry.depth.max = 110;

			entry.depth.average = 80;
			assertPasses(entry);

			entry.depth.average = '60ft';
			assertFails(entry);
		});

		it('average depth must be positve', () => {
			entry.depth.average = 0.8;
			assertPasses(entry);

			entry.depth.average = 0.0;
			assertFails(entry);
		});

		it('average depth may not be greater than max depth', () => {
			entry.depth.average = 91;
			entry.depth.max = 90;
			assertFails(entry);
		});
	});

	describe('temperature section:', () => {

		const keys = ['surface', 'water', 'thermocline1', 'thermocline2'];

		it('is not required', () => {
			entry.temperature = undefined;
			assertPasses(entry);

			entry.temperature = null;
			assertPasses(entry);
		});

		it('temperatures are not required', () => {
			keys.forEach(k => {
				entry.temperature[k] = undefined;
				assertPasses(entry);

				entry.temperature[k] = null;
				assertPasses(entry);
			});
		});

		it('temperatures must be numbers', () => {
			keys.forEach(k => {
				entry.temperature[k] = '66 degrees';
				assertFails(entry);

				entry.temperature[k] = 45.6;
				assertPasses(entry);
			});
		});

		it('temperatures (except for surface) can be no less than 30F', () => {
			keys.forEach(k => {
				entry.temperature[k] =
					k === 'surface'
					? -78.0
					: 29.5;
				assertFails(entry);

				entry.temperature[k] = 30.0;
				assertPasses(entry);
			});
		});

		it('temperatures can be no more than 150F', () => {
			keys.forEach(k => {
				entry.temperature[k] = 150.2;
				assertFails(entry);

				entry.temperature[k] = 150.0;
				assertPasses(entry);
			});
		});
	});

	describe('exposure section:', () => {

		const allowedTypes = ['none', 'shorty', 'full', 'dry'];
		const booleans = ['gloves', 'hood', 'boots'];

		it('is not required', () => {
			entry.exposure = undefined;
			assertPasses(entry);

			entry.exposure = null;
			assertPasses(entry);
		});

		it('body is not required', () => {
			entry.exposure.body = undefined;
			assertPasses(entry);

			entry.exposure.body = null;
			assertPasses(entry);
		});

		it('body will accept permitted values', () => {
			allowedTypes.forEach(t => {
				entry.exposure.body = t;
				assertPasses(entry);
			});
		});

		it('body will not accept other values', () => {
			entry.exposure.body = 'other';
			assertFails(entry);

			entry.exposure.body = true;
			assertFails(entry);
		});

		it('thickness is not required', () => {
			entry.exposure.thickness = undefined;
			assertPasses(entry);

			entry.exposure.thickness = null;
			assertPasses(entry);
		});

		it('thickness must be an integer', () => {
			entry.exposure.thickness = '5mm';
			assertFails(entry);

			entry.exposure.thickness = 3.2;
			assertFails(entry);
		});

		it('thickness can be no less than 1', () => {
			entry.exposure.thickness = 0;
			assertFails(entry);

			entry.exposure.thickness = 1;
			assertPasses(entry);
		});

		it('thickness can be no more than 10', () => {
			entry.exposure.thickness = 11;
			assertFails(entry);

			entry.exposure.thickness = 10;
			assertPasses(entry);
		});

		it('the boolean values are not required', () => {
			booleans.forEach(b => {
				entry.exposure[b] = undefined;
				assertPasses(entry);

				entry.exposure[b] = null;
				assertPasses(entry);
			});
		});

		it('the boolean values must be booleans', () => {
			booleans.forEach(b => {
				entry.exposure[b] = 'yes';
				assertFails(entry);

				entry.exposure[b] = true;
				assertPasses(entry);
			});
		});
	});

	describe('equipment section:', () => {

		const equipment
			= ['compass', 'computer', 'knife', 'light', 'scooter', 'slate', 'surfaceMarker'];

		it('is not required', () => {
			entry.equipment = undefined;
			assertPasses(entry);

			entry.equipment = null;
			assertPasses(entry);
		});

		it('values are not required', () => {
			equipment.forEach(v => {
				entry.equipment[v] = undefined;
				assertPasses(entry);

				entry.equipment[v] = null;
				assertPasses(entry);
			});
		});

		it('values must be booleans', () => {
			equipment.forEach(v => {
				entry.equipment[v] = 'yes';
				assertFails(entry);

				entry.equipment[v] = true;
				assertPasses(entry);
			});
		});
	});

	describe('dive type section:', () => {

		const types = ['altitude', 'boat', 'cave', 'deep', 'drift', 'ice', 'night',
			'reef', 'saltWater', 'searchAndRecovery', 'training', 'wreck'];

		it('is not required', () => {
			entry.diveType = undefined;
			assertPasses(entry);

			entry.diveType = null;
			assertPasses(entry);
		});

		it('values are not required', () => {
			types.forEach(v => {
				entry.diveType[v] = undefined;
				assertPasses(entry);

				entry.diveType[v] = null;
				assertPasses(entry);
			});
		});

		it('values must be booleans', () => {
			types.forEach(v => {
				entry.diveType[v] = 'yes';
				assertFails(entry);

				entry.diveType[v] = true;
				assertPasses(entry);
			});
		});
	});

	describe('weight section', () => {

		const correctness = ['too little', 'good', 'too much'];
		const trim = ['feet down', 'good', 'head down'];

		it('is not required', () => {
			entry.weight = undefined;
			assertPasses(entry);

			entry.weight = null;
			assertPasses(entry);
		});

		it('amount is not required', () => {
			entry.weight.amount = undefined;
			assertPasses(entry);

			entry.weight.amount = null;
			assertPasses(entry);
		});

		it('amount must be a number', () => {
			entry.weight.amount = '16lbs';
			assertFails(entry);

			entry.weight.amount = 16.2;
			assertPasses(entry);
		});

		it('amount must be positive', () => {
			entry.weight.amount = 0.0;
			assertFails(entry);

			entry.weight.amount = 0.5;
			assertPasses(entry);
		});

		it('amount can be no more than 100lbs', () => {
			entry.weight.amount = 100.5;
			assertFails(entry);

			entry.weight.amount = 100.0;
			assertPasses(entry);
		});

		it('correctness is not required', () => {
			entry.weight.correctness = undefined;
			assertPasses(entry);

			entry.weight.correctness = null;
			assertPasses(entry);
		});

		it('correctness will accept valid strings', () => {
			correctness.forEach(c => {
				entry.weight.correctness = c;
				assertPasses(entry);
			});
		});

		it('correctness will not accept other values' ,() => {
			entry.weight.correctness = 'pretty good';
			assertFails(entry);
		});

		it('trim is not required', () => {
			entry.weight.trim = undefined;
			assertPasses(entry);

			entry.weight.trim = null;
			assertPasses(entry);
		});

		it('trim will accept valid strings', () => {
			trim.forEach(c => {
				entry.weight.trim = c;
				assertPasses(entry);
			});
		});

		it('trim will not accept other values' ,() => {
			entry.weight.trim = 'pretty good';
			assertFails(entry);
		});

		it('notes is not required', () => {
			entry.weight.notes = undefined;
			assertPasses(entry);

			entry.weight.notes = null;
			assertPasses(entry);
		});

		it('notes accepts strings', () => {
			entry.weight.notes = 'lol. Weight was good.';
			assertPasses(entry);
		});

		it('notes can be no longer than 500 characters', () => {
			entry.weight.notes = faker.lorem.paragraphs(6);
			assertFails(entry);
		});
	});

	it('notes is not required', () => {
		entry.notes = undefined;
		assertPasses(entry);

		entry.notes = null;
		assertPasses(entry);
	});

	it('notes accepts strings', () => {
		entry.notes = 'This dive was fun. Going to do more dives.';
		assertPasses(entry);
	});

	it('notes can be no longer than 1500 characters', () => {
		entry.notes = faker.lorem.paragraphs(10);
		assertFails(entry);
	});

	describe('conditions:', () => {

		const visibility = ['none', 'poor', 'moderate', 'good', 'excellent', 'ultra'];
		const current = ['none', 'mild', 'moderate', 'fast', 'extreme'];
		const surfaceConditions = ['calm', 'moderate', 'rough', 'insane'];
		const weather = ['sunny', 'mainlySunny', 'overcast', 'rainy', 'stormy'];
		const mood = ['terrible', 'bad', 'ok', 'good', 'excellent'];

		it('visibility is not required', () => {
			entry.visibility = undefined;
			assertPasses(entry);

			entry.visibility = null;
			assertPasses(entry);
		});

		it('visibility must be one of the valid values', () => {
			visibility.forEach(v => {
				entry.visibility = v;
				assertPasses(entry);
			});
		});

		it('visibility cannot be other values', () => {
			entry.visibility = 'not a valid value';
			assertFails(entry);

			entry.visibility = false;
			assertFails(entry);
		});

		it('current is not required', () => {
			entry.current = undefined;
			assertPasses(entry);

			entry.current = null;
			assertPasses(entry);
		});

		it('current must be one of the valid values', () => {
			current.forEach(v => {
				entry.current = v;
				assertPasses(entry);
			});
		});

		it('current cannot be other values', () => {
			entry.current = 'not a valid value';
			assertFails(entry);

			entry.current = false;
			assertFails(entry);
		});

		it('surface conditions is not required', () => {
			entry.surfaceConditions = undefined;
			assertPasses(entry);

			entry.surfaceConditions = null;
			assertPasses(entry);
		});

		it('surface conditions must be one of the valid values', () => {
			surfaceConditions.forEach(v => {
				entry.surfaceConditions = v;
				assertPasses(entry);
			});
		});

		it('surface conditions cannot be other values', () => {
			entry.surfaceConditions = 'not a valid value';
			assertFails(entry);

			entry.surfaceConditions = false;
			assertFails(entry);
		});

		it('weather is not required', () => {
			entry.weather = undefined;
			assertPasses(entry);

			entry.weather = null;
			assertPasses(entry);
		});

		it('weather must be one of the valid values', () => {
			weather.forEach(v => {
				entry.weather = v;
				assertPasses(entry);
			});
		});

		it('weather cannot be other values', () => {
			entry.weather = 'not a valid value';
			assertFails(entry);

			entry.weather = false;
			assertFails(entry);
		});

		it('mood is not required', () => {
			entry.mood = undefined;
			assertPasses(entry);

			entry.mood = null;
			assertPasses(entry);
		});

		it('mood must be one of the valid values', () => {
			mood.forEach(v => {
				entry.mood = v;
				assertPasses(entry);
			});
		});

		it('mood cannot be other values', () => {
			entry.mood = 'not a valid value';
			assertFails(entry);

			entry.mood = false;
			assertFails(entry);
		});

	});
});
