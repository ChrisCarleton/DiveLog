import config from '../config';
import db from './database';
import Joi from 'joi';

const OAuth = db.define(
	'OAuth',
	{
		hashKey: 'providerId',
		rangeKey: 'provider',
		schema: {
			providerId: Joi.string(),
			provider: Joi.string(),
			userId: Joi.string()
		},
		tableName: `divelog-${config.env}-oauth`
	}
);

export default OAuth;
