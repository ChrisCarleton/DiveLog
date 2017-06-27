import config from '../config';
import db from './database';
import Joi from 'joi';

const Sessions = db.define(
	'Sessions',
	{
		hashKey: 'id',
		schema: {
			id: Joi.string()
		},
		tableName: `divelog-${config.env}-sessions`
	});

export default Sessions;
