import config from '../config';
import db from './database';
import Joi from 'joi';

const OAuth = db.define({
	`divelog-${config.env}-oauth`,
	{
		hashKey: 'UserName',
		rangeKey: 'Provider',
		schema: {
			UserName: Joi.string(),
			Provider: Joi.string()
		}
	}
});

export default OAuth;
