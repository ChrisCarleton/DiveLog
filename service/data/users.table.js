import config from '../config';
import db from './database';
import Joi from 'joi';

const Users = db.define(
	'Users',
	{
		hashKey: 'UserId',
		timestamps: true,
		schema: {
			UserId: db.types.uuid(),
			UserName: Joi.string(),
			Email: Joi.string().email(),
			DisplayName: Joi.string(),
			PasswordHash: Joi.string()
		},
		tableName: `divelog-${config.env}-users`,
		indexes: [
			{
				hashKey: 'UserName',
				name: 'UserNameIndex',
				type: 'global'
			},
			{
				hashKey: 'Email',
				name: 'EmailIndex',
				type: 'global'
			}
		]
	});

export default Users;
