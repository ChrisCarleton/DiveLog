import AlertBox from './controls/alert-box.jsx';
import Formsy from 'formsy-react';
import React from 'react';
import TextBox from './controls/text-box.jsx';
import UserActions from '../actions/user-actions';

import {
	Col,
	Button,
	Grid,
	Row,
	PageHeader
} from 'react-bootstrap';

class LogIn extends React.Component {
	constructor() {
		super();
	}

	submit(model) {
		UserActions.loginUser(model);
	}

	render() {
		return (
		<div>
			<PageHeader>Log In</PageHeader>
			<AlertBox />
			<Grid>
				<Row>
					<Col md={5}>
						<h4>Log In</h4>
						<Formsy.Form onValidSubmit={ this.submit }>
							<TextBox
								label="User name"
								controlId="username"
								name="username"
								required />
							<TextBox
								label="Password"
								controlId="password"
								name="password"
								isPassword
								required />
							<Button type="submit" bsStyle="primary">
								Log In
							</Button>
						</Formsy.Form>
					</Col>
					<Col md={2}>
						<h4>- or -</h4>
					</Col>
					<Col md={5}>
						<h4>Sign In Using One of These Providers</h4>
					</Col>
				</Row>
			</Grid>
		</div>);
	}
}

export default LogIn;
