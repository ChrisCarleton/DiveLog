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
							<Formsy.Form horizontal>
								<TextBox
									label="User name:"
									controlId="username" />
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
