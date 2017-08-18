import ConnectOAuth from './profile/connect-oauth.jsx';
import GeneralInfo from './profile/general.jsx';
import { IndexLinkContainer, LinkContainer } from 'react-router-bootstrap';
import PageHeader from './controls/page-header.jsx';
import Password from './profile/password.jsx';
import PropTypes from 'prop-types';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import RequireAuth from './controls/require-auth.jsx';
import UserStore from '../stores/user-store';

import {
	Col,
	Grid,
	Nav,
	NavItem,
	Row
} from 'react-bootstrap';

const ALERT_KEY = 'profile';

class Profile extends React.Component {
	constructor() {
		super();

		this.state = {
			user: UserStore.getState().currentUser
		};

		this.onUserChanged = this.onUserChanged.bind(this);
	}

	componentDidMount() {
		UserStore.listen(this.onUserChanged);
	}

	componentWillUnmount() {
		UserStore.unlisten(this.onUserChanged);
	}

	onUserChanged() {
		this.setState(
			Object.assign(
				{},
				this.state,
				{ user: UserStore.getState().currentUser }));
	}

	render() {
		if (!this.state.user) {
			return <RequireAuth />;
		}

		const userName = this.props.match.params.userName;
		const displayName = this.state.user.displayName
			|| this.state.user.userName
			|| '';
		const title = displayName.endsWith('s')
			? `${displayName}' Profile`
			: `${displayName}'s Profile`;

		return (
			<div>
				<PageHeader heading={ title } alertKey={ ALERT_KEY } />
				<Grid>
					<Row>
						<Col xs={ 3 }>
							<Nav bsStyle="pills" stacked>
								<IndexLinkContainer to={ `/profile/${userName}` }>
									<NavItem>My Info</NavItem>
								</IndexLinkContainer>
								<NavItem>Settings</NavItem>
								<NavItem>Privacy</NavItem>
								<LinkContainer to={ `/profile/${userName}/password` }>
									<NavItem>Change Password</NavItem>
								</LinkContainer>
								<LinkContainer to={ `/profile/${userName}/oauth` }>
									<NavItem>Manage OAuth</NavItem>
								</LinkContainer>
							</Nav>
						</Col>
						<Col xs={ 9 }>
							<Switch>
								<Route exact path="/profile/:userName" component={ GeneralInfo } />
								<Route exact path="/profile/:userName/password" component={ Password } />
								<Route exact path="/profile/:userName/oauth" component={ ConnectOAuth } />
								<Route>
									<Redirect to="/errors/notfound" />
								</Route>
							</Switch>
						</Col>
					</Row>
				</Grid>
			</div>);
	}
}

Profile.propTypes = {
	match: PropTypes.object.isRequired
};

export default Profile;
