import AlertActions from '../actions/alert-actions';
import Formsy from 'formsy-react';
import PageHeader from './controls/page-header.jsx';
import React from 'react';
import request from '../request-agent';
import Spinner from './controls/spinner.jsx';
import TextBox from './controls/text-box.jsx';

import {
	Button,
	Col,
	Grid,
	Row
} from 'react-bootstrap';

const ALERT_KEY = 'reset-password';

class ResetPassword extends React.Component {
	constructor() {
		super();
		this.state = {
			sending: false
		};
		this.submit = this.submit.bind(this);
	}

	submit(model, reset) {
		AlertActions.dismissAlert(ALERT_KEY);
		this.setState({ sending: true });
		request
			.get('/api/auth/resetPassword')
			.query({
				email: model.email
			})
			.then(() => {
				AlertActions.showSuccess(
					ALERT_KEY,
					'Password Reset Request Sent',
					'Check your e-mail for a message containing a link to a page where you can reset your password.');
				reset();
			})
			.catch(err => {
				AlertActions.handleErrorResponse(ALERT_KEY, err);
			})
			.finally(() => {
				this.setState({ sending: false });
			});
	}

	render() {
		return (
			<div>
				<PageHeader heading="Reset Password" alertKey={ ALERT_KEY } />
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
								{ this.state.sending
									? <Spinner message="Sending e-mail..." />
									: <Button type="submit" bsStyle="primary">Request Reset</Button> }
							</Formsy.Form>
						</Col>
					</Row>
				</Grid>
			</div>);
	}
}

export default ResetPassword;
