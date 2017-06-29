import Formsy from 'formsy-react';
import React from 'react';
import TextBox from './controls/text-box.jsx';

import {
	Button,
	Col,
	Row,
	Grid,
	PageHeader
} from 'react-bootstrap';

class SignUp extends React.Component {
	constructor() {
		super();
		this.state = {
			value: '',
			canSubmit: false
		};
	}

	render() {
		return (
			<div>
				<PageHeader>Sign Up</PageHeader>

				<Grid>
					<Row>
						<Col md={5}>
							<h4>Create an Account</h4>
							<Formsy.Form className="form-horizontal">
								<TextBox
									label="User name"
									controlId="username"
									name="username"
									validations={{
										matchRegexp: /^[0-9a-zA-Z][0-9a-zA-Z.-_]*[0-9a-zA-Z]$/,
										minLength: 3,
										maxLength: 30
									}}
									validationErrors={{
										matchRegexp: 'User names must contain letters and numbers. Hyphens, periods, and underscores are allowed in the middle.',
										minLength: 'User names must be between 3 and 30 characters long.',
										maxLength: 'User names must be between 3 and 30 characters long.'
									}}
									required />
								<Button bsStyle="primary" disabled={!this.state.canSubmit}>
									Create Account
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

export default SignUp;
