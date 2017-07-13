import config from '../config';
import db from './database';
import Joi from 'joi';

const baseSchema = {
	logId: Joi.string().uuid(),
	ownerId: Joi.string().uuid(),

	entryTime: Joi.string().isoDate().required(),

	diveNumber: Joi.number().integer().min(1),
	diveTime: Joi.object().keys({
		exitTime: Joi.string().isoDate(),
		surfaceInterval: Joi.number().integer().positive(),
		bottomTime: Joi.number().integer().positive(),
		decoStops: Joi.array().items(
			Joi.object().keys({
				depth: Joi.number().positive(),
				duration: Joi.number().positive()
			})
		)
	}),
	
	location: Joi.string(),
	site: Joi.string(),
	gps: Joi.object().keys({
		latitude: Joi.number(),
		longitude: Joi.number()
	}),

	cnsO2Percent: Joi.number().min(0).max(150).precision(2),

	cylinders: Joi.array().items(
		Joi.object().keys({
			gas: Joi.object().keys({
				o2Percent: Joi.number().min(1).max(100).precision(2),
				hePercent: Joi.number().min(0).max(99).precision(2),
				startPressure: Joi.number().greater(1),
				endPressure: Joi.number().min(0).less(Joi.ref('startPressure'))
			}),
			volume: Joi.number().positive(),
			type: Joi.string().regex(/^(aluminum|steel)$/),
			number: Joi.number().integer().min(1)
		})
	),

	depth:Joi.object().keys({
		average: Joi.number().positive(),
		max: Joi.number().positive()
	}),

	temperature: Joi.object().keys({
		surface: Joi.number(),
		water: Joi.number(),
		thermocline1: Joi.number(),
		thermocline2: Joi.number()
	}),

	exposure: Joi.object().keys({
		body: Joi.string().regex(/^(none|shorty|full|dry)$/),
		thickness: Joi.number().integer().min(1).max(10),
		gloves: Joi.boolean(),
		hood: Joi.boolean(),
		boots: Joi.boolean()
	}),

	equipment: Joi.object().keys({
		compass: Joi.boolean(),
		computer: Joi.boolean(),
		knife: Joi.boolean(),
		light: Joi.boolean(),
		scooter: Joi.boolean(),
		slate: Joi.boolean(),
		surfaceMarker: Joi.boolean()
	}),

	diveType: Joi.object().keys({
		altitude: Joi.boolean(),
		boat: Joi.boolean(),
		cave: Joi.boolean(),
		deep: Joi.boolean(),
		drift: Joi.boolean(),
		ice: Joi.boolean(),
		night: Joi.boolean(),
		reef: Joi.boolean(),
		saltWater: Joi.boolean(),
		searchAndRecovery: Joi.boolean(),
		training: Joi.boolean(),
		wreck: Joi.boolean()
	}),

	visibility: Joi.number().min(0).max(101),
	current: Joi.number().min(0).max(100),
	surfaceConditions: Joi.string().regex(/^(calm|moderate|rough)$/),
	weather: Joi.string(),

	mood: Joi.string(),

	weight: Joi.object().keys({
		amount: Joi.number().positive(),
		correctness: Joi.string().regex(/^(too little|good|too much)$/),
		trim: Joi.string().regex(/^(feet down|good|head down)$/),
		notes: Joi.string()
	}),

	notes: Joi.string()
};

export const schema = Joi.object().keys(
	Object.assign({}, baseSchema, {
		createdAt: Joi.string().isoDate(),
		updatedAt: Joi.string().isoDate()
	}));

const DiveLogs = db.define(
	'DiveLogs',
	{
		hashKey: 'logId',
		timestamps: true,
		schema: Object.assign(
			{},
			baseSchema,
			{
				logId: db.types.uuid().required(),
				ownerId: Joi.string().uuid().required()
			}),
		tableName: `divelog-${config.env}-divelogs`,
		indexes: [
			{
				hashKey: 'ownerId',
				rangeKey: 'entryTime',
				name: 'OwnerIndex',
				type: 'global'
			}
		]
	});

export default DiveLogs;
