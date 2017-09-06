import bcrypt from 'bcrypt';
import faker from 'faker';
import geolib from 'geolib';
import moment from 'moment';

const salt = bcrypt.genSaltSync(10);

function generateUser(password) {
	const email = faker.internet.email();
	const dob = moment(faker.date.past(50, new Date())).subtract(12, 'y').toISOString();

	return {
		userName: faker.internet.userName().toLowerCase(),
		displayName: faker.name.findName(),
		email: email.toLowerCase(),
		displayEmail: email,
		location: faker.fake('{{address.cityPrefix}} {{name.firstName}}{{address.citySuffix}}, {{address.countryCode}}'),
		dateOfBirth: dob,
		certificationAgencies: faker.random.arrayElement(['PADI', 'SSI', 'NAUI']),
		diverType: faker.random.arrayElement([
			'novice', 'vacation', 'typical', 'advanced', 'tech', 'commercial',
			'divemaster', 'instructor']),
		numberOfDives: faker.random.arrayElement([
			'unknown', 'no logs', '0', '<20', '<50', '<100', '<500', '<1000',
			'<5000', '<9000', '9000+']),
		passwordHash: bcrypt.hashSync(password || faker.internet.password(9), salt),
		role: 'user'
	};
}

function generateCylinderEntry() {
	return {
		gas: {
			o2Percent: faker.random.number({ min: 21, max: 40 }),
			startPressure: faker.random.number({min: 2800, max: 3500 }),
			endPressure: faker.random.number({ min: 450, max: 1200 })
		},
		volume: faker.random.arrayElement([66, 80, 100]),
		type: faker.random.arrayElement(['aluminum', 'steel'])
	};
}

function generateDiveLogEntry(ownerIds) {
	const entryTime = faker.date.past(5, new Date());
	const diveTime = faker.random.number({ min: 20, max: 65 });
	const averageDepth = faker.random.number({ min: 20, max: 95 });

	const ownerId = () => {
		if (!ownerIds) {
			return faker.random.uuid();
		}

		if (typeof ownerIds === 'string') {
			return ownerIds;
		}

		return faker.random.arrayElement(ownerIds);
	};

	return {
		ownerId: ownerId(),
		entryTime: entryTime.toISOString(),
		diveNumber: faker.random.number({ min: 1, max: 500 }),
		diveTime: {
			diveLength: diveTime,
			surfaceInterval: faker.random.number({ min: 15, max: 120}),
			bottomTime: diveTime - 5,
			decoStops: [
				{
					depth: 15,
					duration: 3
				}
			]
		},

		location: faker.fake('{{address.cityPrefix}} {{name.firstName}}{{address.citySuffix}}, {{address.countryCode}}'),
		site: faker.fake('{{name.lastName}} {{address.cityPrefix}}'),
		gps: {
			latitude: geolib.decimal2sexagesimal(faker.address.latitude()),
			longitude: geolib.decimal2sexagesimal(faker.address.longitude())
		},

		cnsO2Percent: faker.random.number({ min: 5, max: 80 }),

		cylinders: [ generateCylinderEntry() ],

		depth: {
			average: averageDepth,
			max: faker.random.number({ min: averageDepth, max: 120 })
		},

		temperature: {
			surface: faker.random.number({ min: 12, max: 96 }),
			water: faker.random.number({ min: 55, max: 78 }),
			thermocline1: faker.random.number({ min: 38, max: 54 })
		},

		exposure: {
			body: faker.random.arrayElement(['none', 'shorty', 'full', 'dry']),
			thickness: faker.random.arrayElement([3, 5, 7]),
			gloves: faker.random.boolean(),
			hood: faker.random.boolean(),
			boots: faker.random.boolean()
		},

		equipment: {
			compass: faker.random.boolean(),
			computer: faker.random.boolean(),
			knife: faker.random.boolean(),
			light: faker.random.boolean(),
			scooter: faker.random.boolean(),
			slate: faker.random.boolean(),
			surfaceMarker: faker.random.boolean()
		},

		diveType: {
			altitude: faker.random.boolean(),
			boat: faker.random.boolean(),
			cave: faker.random.boolean(),
			deep: faker.random.boolean(),
			drift: faker.random.boolean(),
			ice: faker.random.boolean(),
			night: faker.random.boolean(),
			reef: faker.random.boolean(),
			saltWater: faker.random.boolean(),
			searchAndRecovery: faker.random.boolean(),
			training: faker.random.boolean(),
			wreck: faker.random.boolean()
		},

		visibility: faker.random.arrayElement(['none', 'poor', 'moderate', 'good', 'excellent', 'ultra']),
		current: faker.random.arrayElement(['none', 'mild', 'moderate', 'fast', 'extreme']),
		surfaceConditions: faker.random.arrayElement(['calm', 'moderate', 'rough', 'insane']),
		weather: faker.random.arrayElement(['sunny', 'mainlySunny', 'overcast', 'rainy', 'stormy']),
		mood: faker.random.arrayElement(['terrible', 'bad', 'ok', 'good', 'excellent']),

		weight: {
			amount: faker.random.number({ min: 6, max: 32 }),
			correctness: faker.random.arrayElement(['too little', 'good', 'too much']),
			trim: faker.random.arrayElement(['feet down', 'good', 'head down']),
			notes: faker.lorem.sentence()
		},

		notes: faker.lorem.paragraph(5)
	};
}

export default {
	generateUser: generateUser,
	generateCylinderEntry: generateCylinderEntry,
	generateDiveLogEntry: generateDiveLogEntry
};
