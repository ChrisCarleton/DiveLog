import AlertBox from './controls/alert-box.jsx';
import { IndexLinkContainer, LinkContainer } from 'react-router-bootstrap';
import React from 'react';
import UserActions from '../actions/user-actions';
import UserStore from '../stores/user-store';

import {
	MenuItem, Nav, Navbar, NavDropdown, NavItem
} from 'react-bootstrap';

class AppNavbar extends React.Component {
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

	onUserChanged(userInfo) {
		const state = Object.assign({}, this.state, { user: userInfo.currentUser });
		this.setState(state);
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
					</Nav>
					{ this.state.user ?
						<Nav pullRight>
							<NavDropdown id="user-nav" title={ this.state.user.displayName || this.state.user.userName }>
								<MenuItem divider />
								<MenuItem onClick={ UserActions.signOutUser }>Log Out</MenuItem>
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
				<AlertBox />
			</Navbar>);
	}
}

export default AppNavbar;
