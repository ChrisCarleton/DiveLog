import config from '../config';
import db from './database';
import Joi from 'joi';

const Users = db.define(
	'Users',
	{
		hashKey: 'userId',
		timestamps: true,
		schema: {
			userId: db.types.uuid(),
			userName: Joi.string(),
			email: Joi.string().email(),
			displayName: Joi.string(),
			passwordHash: Joi.string(),
			role: Joi.string().valid(['user', 'admin']),
			imageUrl: Joi.string(),
			passwordResetToken: Joi.string().alphanum().length(20),
			passwordResetExpiration: Joi.string().isoDate()
		},
		tableName: `divelog-${config.env}-users`,
		indexes: [
			{
				hashKey: 'userName',
				name: 'UserNameIndex',
				type: 'global'
			},
			{
				hashKey: 'email',
				name: 'EmailIndex',
				type: 'global'
			}
		]
	});

export default Users;
