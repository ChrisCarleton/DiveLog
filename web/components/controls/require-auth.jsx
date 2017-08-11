import { Redirect } from 'react-router';
import React from 'react';
import UserStore from '../../stores/user-store';

class RequireAuth extends React.Component {
	constructor() {
		super();
		this.state = UserStore.getState();
	}

	onUserUpdated() {
		this.setState(UserStore.getState());
	}

	componentDidMount() {
		UserStore.listen(this.onUserUpdated);
	}

	componentWillUnmount() {
		UserStore.unlisten(this.onUserUpdated);
	}

	render() {
		return this.state.currentUser ? null : <Redirect to="/" />;
	}
}

export default RequireAuth;
