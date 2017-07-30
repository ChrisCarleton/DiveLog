import Bluebird from 'bluebird';
import { EmailInUseError, MissingEmailError } from '../../utils/exceptions';
import faker from 'faker';
import OAuth from '../../data/oauth.table';
import Users from '../../data/users.table';

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

