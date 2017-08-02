import config from '../config';
import db from './database';
import Joi from 'joi';

const baseSchema = {
	logId: Joi.string().uuid(),
	ownerId: Joi.string().uuid(),

	entryTime: Joi.string().isoDate().required(),

	diveNumber: Joi.number().integer().min(1),
	diveTime: Joi.object().keys({
		diveLength: Joi.number().integer().positive().required(),
		surfaceInterval: Joi.number().integer().positive(),
		bottomTime: Joi.number().integer().positive(),
		decoStops: Joi.array().items(
			Joi.object().keys({
				depth: Joi.number().positive(),
				duration: Joi.number().positive()
			})
		)
	}),

	location: Joi.string().required(),
	site: Joi.string().required(),
	gps: Joi.object().keys({
		latitude: Joi.string(),
		longitude: Joi.string()
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

	visibility: Joi.string().regex(/^(none|poor|moderate|good|excellent|ultra)$/),
	current: Joi.string().regex(/^(none|mild|moderate|fast|extreme)$/),
	surfaceConditions: Joi.string().regex(/^(calm|moderate|rough|insane)$/),
	weather: Joi.string().regex(/^(sunny|mainlySunny|overcast|rainy|stormy)$/),
	mood: Joi.string().regex(/^(terrible|bad|ok|good|excellent)$/),

	weight: Joi.object().keys({
		amount: Joi.number().positive(),
		correctness: Joi.string().regex(/^(too little|good|too much)$/),
		trim: Joi.string().regex(/^(feet down|good|head down)$/),
		notes: Joi.string()
	}),

	notes: Joi.string()
};

export const createSchema = Joi.object().keys(baseSchema);

export const updateSchema = Joi.object().keys(
	Object.assign({}, baseSchema, {
		// These are not required on update - but cannot be removed from the database!
		entryTime: Joi.string().isoDate().invalid(null),
		location: Joi.string().invalid(null),
		site: Joi.string().invalid(null),

		// Allow these just in case users are posting back objects they just received
		// with small modifications.
		createdAt: Joi.any().strip(),
		updatedAt: Joi.any().strip()
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
				type: 'global',
				projection: {
					ProjectionType: 'INCLUDE',
					NonKeyAttributes: ['logId', 'diveNumber', 'location', 'site', 'depth']
				}
			}
		]
	});

export default DiveLogs;
