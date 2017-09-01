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
			userName: Joi.string().required(),
			email: Joi.string().email().max(150).required(),
			displayEmail: Joi.string().email().max(150).required(),
			displayName: Joi.string().max(100),
			location: Joi.string().max(150),
			dateOfBirth: Joi.string().isoDate(),
			certificationAgencies: Joi.string().max(250),
			diverType: Joi.string().valid([
				'novice',
				'vacation',
				'typical',
				'advanced',
				'tech',
				'commercial',
				'divemaster',
				'instructor']),
			numberOfDives: Joi.string().valid([
				'unknown',
				'no logs',
				'0',
				'<20',
				'<50',
				'<100',
				'<500',
				'<1000',
				'<5000',
				'<9000',
				'9000+']),
			passwordHash: Joi.string(),
			role: Joi.string().valid(['user', 'admin']).required(),
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
