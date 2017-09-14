import Formsy from 'formsy-react';
import { IndexLinkContainer } from 'react-router-bootstrap';
import PageHeader from './controls/page-header.jsx';
import React from 'react';
import RequireAuth from './controls/require-auth.jsx';

import {
	Breadcrumb,
	Button,
	ButtonGroup,
	ButtonToolbar,
	ControlLabel,
	FormControl,
	FormGroup,
	Glyphicon,
	InputGroup
} from 'react-bootstrap';

const ALERT_KEY = 'admin';

class AdminDashboard extends React.Component {
	search() {

	}

	render() {
		return (
			<div>
				<RequireAuth requireAdmin />
				<Breadcrumb>
					<IndexLinkContainer to="/">
						<Breadcrumb.Item>Home</Breadcrumb.Item>
					</IndexLinkContainer>
					<Breadcrumb.Item active>Admin Dashboard</Breadcrumb.Item>
				</Breadcrumb>
				<PageHeader alertKey={ ALERT_KEY } heading="Admin Dashboard" />

				<Formsy.Form onValidSubmit={ this.search }>
					<FormGroup>
						<ControlLabel>
							Search:
						</ControlLabel>
						<InputGroup>
							<FormControl type="text" placeholder="User name or e-mail address" />
							<InputGroup.Button>
								<Button type="submit">
									<Glyphicon glyph="search" />
								</Button>
							</InputGroup.Button>
						</InputGroup>
					</FormGroup>
				</Formsy.Form>

				<ButtonToolbar>
					<ButtonGroup>
						<Button bsStyle="primary">Create User</Button>
					</ButtonGroup>
				</ButtonToolbar>
			</div>);
	}
}

export default AdminDashboard;
