import { IndexLinkContainer, LinkContainer } from 'react-router-bootstrap';
import React from 'react';

import {
	Nav, Navbar, NavItem
} from 'react-bootstrap';

class AppNavbar extends React.Component {
	render() {
		return (
			<Navbar inverse collapseOnSelect>
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
					<Nav pullRight>
						<LinkContainer to="/login">
							<NavItem>Log In</NavItem>	
						</LinkContainer>
						<LinkContainer to="/signup">
							<NavItem>Sign Up</NavItem>
						</LinkContainer>
					</Nav>
				</Navbar.Collapse>
			</Navbar>);
	}
}

export default AppNavbar;
