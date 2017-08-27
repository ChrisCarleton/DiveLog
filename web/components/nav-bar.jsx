import { IndexLinkContainer, LinkContainer } from 'react-router-bootstrap';
import PropTypes from 'prop-types';
import React from 'react';
import UserActions from '../actions/user-actions';
import UserStore from '../stores/user-store';
import { withRouter } from 'react-router';

import {
	MenuItem, Nav, Navbar, NavDropdown, NavItem
} from 'react-bootstrap';

class AppNavbar extends React.Component {
	constructor() {
		super();
		this.state = {
			user: UserStore.getState().currentUser
		};
		if (this.state.user && (!this.state.user.hasPassword || this.state.user.passwordHash)) {
			console.error('Error: Unsanitized user information!');
		}
		this.onUserChanged = this.onUserChanged.bind(this);
		this.onLogOutClicked = this.onLogOutClicked.bind(this);
		this.renderUserNav = this.renderUserNav.bind(this);
	}

	componentDidMount() {
		UserStore.listen(this.onUserChanged);
	}

	componentWillUnmount() {
		UserStore.unlisten(this.onUserChanged);
	}

	onUserChanged(userInfo) {
		const state = Object.assign({}, this.state, { user: userInfo.currentUser });
		this.setState(state);
		if (this.state.user && (!this.state.user.hasPassword || this.state.user.passwordHash)) {
			console.error('Error: Unsanitized user information!');
		}
	}

	onLogOutClicked() {
		UserActions.signOutUser();
		this.props.history.push('/');
	}

	renderUserNav() {
		if (!this.state.user) {
			return null;
		}

		return (
			<LinkContainer to={ `/logbook/${this.state.user.userName}` }>
				<NavItem>Log Book</NavItem>
			</LinkContainer>);
	}

	render() {
		return (
			<Navbar fixedTop inverse collapseOnSelect>
				<Navbar.Header>
					<Navbar.Brand>
						<IndexLinkContainer to="/">
							<a href="#">Bottom Time</a>
						</IndexLinkContainer>
					</Navbar.Brand>
					<Navbar.Toggle />
				</Navbar.Header>
				<Navbar.Collapse>
					<Nav>
						<IndexLinkContainer to="/">
							<NavItem>Home</NavItem>
						</IndexLinkContainer>
						{ this.renderUserNav() }
					</Nav>
					{ this.state.user ?
						<Nav pullRight>
							<NavDropdown id="user-nav" title={ this.state.user.displayName || this.state.user.userName }>
								<LinkContainer to={ `/profile/${this.state.user.userName}` }>
									<MenuItem>Profile</MenuItem>
								</LinkContainer>
								<MenuItem divider />
								<MenuItem onClick={ this.onLogOutClicked }>Log Out</MenuItem>
							</NavDropdown>
						</Nav>
						:
						<Nav pullRight>
							<LinkContainer to="/login">
								<NavItem>Log In</NavItem>
							</LinkContainer>
							<LinkContainer to="/signup">
								<NavItem>Sign Up</NavItem>
							</LinkContainer>
						</Nav>
					}
				</Navbar.Collapse>
			</Navbar>);
	}
}

AppNavbar.propTypes = {
	history: PropTypes.object.isRequired
};

export default withRouter(AppNavbar);
