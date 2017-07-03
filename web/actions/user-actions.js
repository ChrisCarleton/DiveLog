import AlertActions from './alert-actions';
import alt from '../alt';
import request from '../request-agent';

class UserActions {
	loginUser(credentials) {
		return dispatch => {
			dispatch();
			request
				.post('/api/auth/login/')
				.send(credentials)
				.then(res => {
					this.signInSucceeded(res.body);
				})
				.catch(AlertActions.handleErrorResponse);			
		};
	}

	signUpUser(info) {
		return dispatch => {
			dispatch();
			info.confirmPassword = undefined;
			request
				.post('/api/users/')
				.send(info)
				.then(res => {
					this.signInSucceeded(res.body);
				})
				.catch(AlertActions.handleErrorResponse);
		};
	}

	signOutUser() {
		return dispatch => {
			dispatch();
			request
				.post('/api/auth/logout/')
				.then(() => {
					this.signOutSucceeded();
				})
				.catch(AlertActions.handleErrorResponse);
		};
	}

	signInSucceeded(user) {
		return user;
	}

	signOutSucceeded() {
		return {};
	}
}

export default alt.createActions(UserActions);
