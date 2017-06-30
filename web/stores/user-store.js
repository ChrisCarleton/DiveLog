import alt from '../alt';
import UserActions from '../actions/user-actions';

class UserStore {
	constructor() {
		this.user = null;
		this.bindListeners({
			signInUser: UserActions.signInUser
		});
	}

	signInUser(user) {
		this.user = user;
	}

	signOutUser() {
		this.user = null;
	}
}

export default alt.createStore(UserStore, 'UserStore');
