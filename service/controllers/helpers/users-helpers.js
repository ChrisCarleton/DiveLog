import _ from 'lodash';
import bcrypt from 'bcrypt';
import Bluebird from 'bluebird';
import faker from 'faker';
import moment from 'moment';
import OAuth from '../../data/oauth.table';
import Users from '../../data/users.table';

import {
	BadPasswordError,
	EmailInUseError,
	ForbiddenActionError,
	MissingEmailError,
	RejectedPasswordResetError,
	WeakPasswordError
} from '../../utils/exceptions';

export const PasswordStrengthRegex = /(?=^[!@#$%^&*()_\-+=[{\]};:<>|./?a-zA-Z\d]{7,}$)(?=([!@#$%^&*()_\-+=[{\]};:<>|./?a-zA-Z\d]*\W+){1,})[!@#$%^&*()_\-+=[{\]};:<>|./?a-zA-Z\d]*$/;

export function getOAuthAccounts(userName) {
	return getUserByName(userName)
		.then(user => {
			if (!user) {
				return [];
			}

			return OAuth
				.query(user.userId)
				.usingIndex('UserIdIndex')
				.loadAll()
				.execAsync();
		})
		.then(result => {
			return _.map(result.Items, oa => {
				return oa.get('provider');
			});
		});
}

export function getUserByName(userName) {
	return Users
		.query(userName)
		.usingIndex('UserNameIndex')
		.limit(1)
		.execAsync()
		.then(res => {
			if (res.Items.length === 0) {
				return null;
			}

			return res.Items[0].attrs;
		});
}

export function getUserByEmail(email) {
	return Users
		.query(email)
		.usingIndex('EmailIndex')
		.limit(1)
		.execAsync()
		.then(res => {
			if (res.Items.length === 0) {
				return null;
			}

			return res.Items[0].attrs;
		});
}

const createNewOAuthAccount = (profile) => {
	let user;

	if (!profile.emails || profile.emails.length === 0 || !profile.emails[0].value) {
		return Bluebird.reject(
			new MissingEmailError(
				'Profile information did not contain any email addresses.'));
	}

	// First check to make sure the e-mail is not already in use - that would
	// be a problem!
	return getUserByEmail(profile.emails[0].value)
		.then(user => {
			if (user) {
				// Drat! This user will have to sign in using their existing credentials
				// and connect their account to this OAuth provider.
				throw new EmailInUseError(`E-mail address "${profile.emails[0].value}" is already in use.`);
			}

			let imageUrl = undefined;
			if (profile.photos && profile.photos[0]) {
				imageUrl = profile.photos[0].value;
			}

			return Users.createAsync({
				userName: faker.random.alphaNumeric(12),
				email: profile.emails[0].value,
				displayName: profile.displayName,
				role: 'user',
				imageUrl: imageUrl
			});
		})
		.then(userRec => {
			user = userRec;
			return OAuth.createAsync({
				providerId: profile.id,
				provider: profile.provider,
				userId: user.get('userId'),
				email: profile.emails[0].value
			});
		})
		.then(() => {
			return user;
		});
};

export function getOrCreateOAuthAccount(profile) {
	return OAuth.getAsync(profile.id, profile.provider)
		.then(oauth => {
			if (!oauth) {
				// New user! We'll attempt to create an account for them!!
				return createNewOAuthAccount(profile);
			}

			return Users.getAsync(oauth.get('userId'));
		})
		.then(user => {
			if (!user) {
				// Wat? This shouldn't happen - but we'll fix it!
				return OAuth.destroyAsync(profile.id, profile.provider)
					.then(() => {
						return createNewOAuthAccount(profile);
					})
					.then(user => {
						return user.attrs;
					});
			}

			return user.attrs;
		});
}

export function getOrConnectOAuthAccount(user, profile) {
	return OAuth.getAsync(profile.id, profile.provider)
		.then(oauth => {
			if (!oauth) {
				return OAuth.createAsync({
					providerId: profile.id,
					provider: profile.provider,
					userId: user.userId,
					email: profile.emails[0].value })
					.then(() => { return user; });
			}

			if (oauth.get('userId') !== user.userId) {
				// This provider is already connected to another user account.
				// The user may have to merge multiple accounts but this is not the
				// place to do it.
				throw new ForbiddenActionError(
					'OAuth account is already connected to another user account.');
			}

			return user;
		});
}

export function removeOAuthConnection(user, provider) {
	return OAuth
		.query(user.userId)
		.usingIndex('UserIdIndex')
		.loadAll()
		.execAsync()
		.then(results => {
			if (results.Items.length === 0) return;

			const items = _.remove(
				results.Items,
				i => { return i.get('provider') === provider; });

			if (items.length === 0) return;

			if (results.Items.length === 0 && !user.hasPassword) {
				throw new ForbiddenActionError(
					'Users who do not have passwords on their accounts may not remove all of their OAuth providers.');
			}

			return OAuth.destroyAsync(
				items[0].get('providerId'),
				items[0].get('provider'));
		});
}

export function doChangePassword(user, oldPassword, newPassword) {
	const salt = bcrypt.genSaltSync(10);
	const passwordHash = bcrypt.hashSync(newPassword, salt);

	if (!PasswordStrengthRegex.test(newPassword)) {
		return Bluebird.reject(new WeakPasswordError('New password did not meet strength criteria'));
	}

	if (!bcrypt.compareSync(oldPassword, user.passwordHash)) {
		return Bluebird.reject(new BadPasswordError('Old password was incorrect.'));
	}

	return Users.updateAsync({ userId: user.userId, passwordHash: passwordHash });
}

export function doRequestPasswordReset(email) {
	return getUserByEmail(email)
		.then(user => {
			if (user === null) {
				return null;
			}

			if (!user.passwordHash) {
				return null;
			}

			return Users.updateAsync({
				userId: user.userId,
				passwordResetToken: faker.random.alphaNumeric(20),
				passwordResetExpiration: moment().add(1, 'd').toISOString()
			});
		})
		.then(result => {
			if (!result) {
				return null;
			}

			return result.attrs;
		});
}

export function doPerformPasswordReset(user, token, newPassword) {
	if (!user.passwordResetToken || !user.passwordResetExpiration) {
		return Bluebird.reject(new RejectedPasswordResetError(
			`User "${user.userName}" has not requested a password reset.`));
	}

	if (user.passwordResetToken !== token) {
		return Bluebird.reject(new RejectedPasswordResetError(
			`Reset token did not match the one on file for user "${user.userName}".`));
	}

	if (moment().isAfter(user.passwordResetExpiration)) {
		return Bluebird.reject(new RejectedPasswordResetError(
			`Reset token has expired for user "${user.userName}".`));
	}

	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(newPassword, salt);

	return Users.updateAsync({
		userId: user.userId,
		passwordHash: hash,
		passwordResetToken: null,
		passwordResetExpiration: null })
		.then(() => {
			return true;
		});
}

export function sanitizeUserInfo(user) {
	const sanitized = _.pick(user, [
		'userId',
		'userName',
		'email',
		'displayName',
		'role',
		'imageUrl',
		'createdAt']);
	sanitized.hasPassword = !_.isNil(user.passwordHash);

	return sanitized;
}
