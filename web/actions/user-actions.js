import alt, { baseUrl } from '../alt';
import agent from 'superagent-promise';

const request = agent(baseUrl);

class UserActions {
	signInUser(user) {
		return user;
	}

	signUpUser(info) {
		request
			.post('/api/users/')
			.send(info)
			.then(() => {})
			.catch(() => {});
	}

	signOutUser() {
		return null;
	}
}

export default alt.createActions(UserActions);
