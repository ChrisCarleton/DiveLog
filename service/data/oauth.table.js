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
			userId: Joi.string().required(),
			email: Joi.string().required()
		},
		tableName: `divelog-${config.env}-oauth`,
		indexes: [
			{
				hashKey: 'userId',
				rangeKey: 'provider',
				name: 'UserIdIndex',
				type: 'global',
				projection: {
					ProjectionType: 'KEYS_ONLY'
				}
			}
		]
	}
);

export default OAuth;
