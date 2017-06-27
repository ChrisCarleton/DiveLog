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
						<a href="#">Bottom Time</a>
					</Navbar.Brand>
					<Navbar.Toggle />
				</Navbar.Header>
				<Navbar.Collapse>
					<Nav>
						<NavItem href="#">Home</NavItem>
					</Nav>
				</Navbar.Collapse>
			</Navbar>);
	}
}

export default AppNavbar;
