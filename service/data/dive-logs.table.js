import config from '../config';
import db from './database';
import Joi from 'joi';

const DiveLogs = db.define(
	'DiveLogs',
	{
		hashKey: 'logId',
		timestamps: true,
		schema: {
			logId: db.types.uuid(),
			ownerId: Joi.string().uuid(),
			diveNumber: Joi.number().integer().min(1),
			diveTime: Joi.object().keys({
				entryTime: Joi.string().isoDate(),
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
						hePercent: Joi.number().min(0).max(99).precision(2)
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

			visibility: Joi.number().min(0).max(101),
			current: Joi.number().min(0).max(100)
		},
		tableName: `divelog-${config.env}-divelogs`,
		// indexes: [

		// ]
	});

export default DiveLogs;
