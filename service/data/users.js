import config from '../config';
import db from './database';
import Joi from 'joi';

const Users = db.define(
	`divelog-${config.env}-users`,
	{
		hashKey: 'UserId',
		timestamps: true,
		schema: {
			UserId: Joi.string(),
			UserName: Joi.string(),
			Email: Joi.string().email(),
			DisplayName: Joi.string(),
			PasswordHash: Joi.string()
		},
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
