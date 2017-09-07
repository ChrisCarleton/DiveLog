import PropTypes from 'prop-types';
import queryString from 'query-string';
import { Redirect } from 'react-router';
import React from 'react';
import UserStore from '../../stores/user-store';
import { withRouter } from 'react-router';

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
		if (!this.state.currentUser) {
			const query = queryString.stringify({ returnTo: this.props.location.pathname });
			return <Redirect to={ `/login?${query}` } />;
		}

		if (this.props.requireAdmin && this.state.currentUser.role !== 'admin') {
			return <Redirect to="/" />
		}

		return null;
	}
}

RequireAuth.propTypes = {
	location: PropTypes.object.isRequired,
	requireAdmin: PropTypes.bool
};

export default withRouter(RequireAuth);
