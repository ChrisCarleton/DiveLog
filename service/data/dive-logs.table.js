import config from '../config';
import db from './database';
import Joi from 'joi';

export const schema = {
	logId: Joi.string().uuid().required(),
	ownerId: Joi.string().uuid().required(),
	entryTime: Joi.string().isoDate().required(),

	createdAt: Joi.string().isoDate(),
	modifiedAt: Joi.string().isoDate(),

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
		lat: Joi.string(),
		long: Joi.string()
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

	exposure: Joi.object().keys({
		body: Joi.string().regex(/^(none|shorty|full|dry)$/),
		thickness: Joi.number().integer().min(1).max(10),
		gloves: Joi.boolean(),
		hood: Joi.boolean()
	}),

	equipment: Joi.object().keys({
		compass: Joi.boolean(),
		computer: Joi.boolean(),
		knife: Joi.boolean(),
		scooter: Joi.boolean(),
		slate: Joi.boolean(),
		surfaceMarker: Joi.boolean()
	}),

	diveType: Joi.object().keys({
		boat: Joi.boolean(),
		cave: Joi.boolean(),
		deep: Joi.boolean(),
		drift: Joi.boolean(),
		ice: Joi.boolean(),
		night: Joi.boolean(),
		reef: Joi.boolean(),
		saltWater: Joi.boolean(),
		searchAndRescue: Joi.boolean(),
		training: Joi.boolean(),
		wreck: Joi.boolean()
	}),

	visibility: Joi.number().min(0).max(101),
	current: Joi.number().min(0).max(100),
	weather: Joi.string(),

	weight: Joi.object().keys({
		amount: Joi.number().positive(),
		correctness: Joi.string().regex(/^(too little|good|too much)$/),
		trim: Joi.string().regex(/^(feet down|good|head down)$/),
		notes: Joi.string()
	}),

	notes: Joi.string()
};

const DiveLogs = db.define(
	'DiveLogs',
	{
		hashKey: 'logId',
		timestamps: true,
		schema: Object.assign(
			{},
			schema,
			{
				logId: db.types.uuid(),
				createdAt: undefined,
				modifiedAt: undefined
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
