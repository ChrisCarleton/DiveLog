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
			diveDate: Joi.number().integer()
		},
		tableName: `divelog-${config.env}-divelogs`,
		// indexes: [

		// ]
	});

export default DiveLogs;
