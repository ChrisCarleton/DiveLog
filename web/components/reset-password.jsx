import Formsy from 'formsy-react';
import PageHeader from './controls/page-header.jsx';
import React from 'react';
import TextBox from './controls/text-box.jsx';

import {
	Button,
	Col,
	Grid,
	Row
} from 'react-bootstrap';

class ResetPassword extends React.Component {
	constructor() {
		super();
		this.submit = this.submit.bind(this);
	}

	submit(model) {
		console.log(model);
	}

	render() {
		return (
			<div>
				<PageHeader heading="Reset Password" alertKey="reset-password" />
				<Grid>
					<Row>
						<Col xs={ 12 } md={ 6 }>
							<p>
								Enter the e-mail address associated with your account below and click
								&nbsp;<strong>Request Reset</strong>. We will send you an e-mail that will
								allow you to reset your password and continue using the site!
							</p>
						</Col>
					</Row>

					<Row>
						<Col xs={12} md={6}>
							<Formsy.Form className="form-horizontal" onValidSubmit={ this.submit }>
								<TextBox
									label="E-mail address"
									controlId="email"
									name="email"
									validations={{
										isEmail: true
									}}
									validationErrors={{
										isEmail: 'Must be a valid e-mail address.'
									}}
									required />
								<Button type="submit" bsStyle="primary">Request Reset</Button>
							</Formsy.Form>
						</Col>
					</Row>
				</Grid>
			</div>);
	}
}

export default ResetPassword;
