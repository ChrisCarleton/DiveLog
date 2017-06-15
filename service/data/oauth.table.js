import config from '../config';
import db from './database';
import Joi from 'joi';

const OAuth = db.define(
	'OAuth',
	{
		hashKey: 'UserName',
		rangeKey: 'Provider',
		schema: {
			UserName: Joi.string(),
			Provider: Joi.string()
		},
		tableName: `divelog-${config.env}-oauth`
	}
);

export default OAuth;
