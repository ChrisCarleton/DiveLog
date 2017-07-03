import alt from '../alt';
import UserActions from '../actions/user-actions';

class UserStore {
	constructor() {
		this.currentUser = null;
		this.bindListeners({
			signInUser: UserActions.SIGN_IN_SUCCEEDED,
			signOutUser: UserActions.SIGN_OUT_SUCCEEDED
		});

		this.signInUser = this.signInUser.bind(this);
		this.signOutUser = this.signOutUser.bind(this);
	}

	signInUser(user) {
		this.currentUser = user;
	}

	signOutUser() {
		this.currentUser = null;
	}
}

export default alt.createStore(UserStore, 'UserStore');
