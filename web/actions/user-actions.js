import CurrentEntryActions from './current-entry-actions';
import DiveLogActions from './dive-log-actions';
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
				.catch(err => {
					AlertActions.handleErrorResponse('login', err);
				});
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
				.catch(err => {
					AlertActions.handleErrorResponse('sign-up', err);
				});
		};
	}

	signOutUser() {
		return dispatch => {
			dispatch();
			request
				.post('/api/auth/logout/')
				.then(() => {
					CurrentEntryActions.clearEntry();
					DiveLogActions.clearEntries();
					this.signOutSucceeded();
				})
				.catch(err => {
					AlertActions.handleErrorResponse('global', err);
				});
		};
	}

	signInSucceeded(user) {
		return user;
	}

	signOutSucceeded() {
		return {};
	}

	updateProfile(user) {
		return user;
	}
}

export default alt.createActions(UserActions);
