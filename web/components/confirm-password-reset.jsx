import AlertActions from '../actions/alert-actions';
import Formsy from 'formsy-react';
import NotFound from './errors/not-found.jsx';
import PageHeader from './controls/page-header.jsx';
import passwordStrengthRegex from '../../service/utils/password-strength-regex';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React from 'react';
import request from '../request-agent';
import Spinner from './controls/spinner.jsx';
import TextBox from './controls/text-box.jsx';
import { withRouter } from 'react-router';

import {
	Button,
	Col,
	Grid,
	Row
} from 'react-bootstrap';

const ALERT_KEY = 'confirm-password-reset';

class ConfirmPasswordReset extends React.Component {
	constructor(props) {
		super(props);
		const query = queryString.parse(props.location.search);
		this.state = {
			user: query.user,
			token: query.token,
			submitting: false
		};
		this.submit = this.submit.bind(this);
	}

	submit(model, reset, invalidate) {
		AlertActions.dismissAlert(ALERT_KEY);
		this.setState(
			Object.assign(
				{},
				this.state,
				{ submitting: true }));
		request
			.post(`/api/auth/${this.state.user}/resetPassword`)
			.send({
				token: this.state.token,
				newPassword: model.newPassword
			})
			.then(() => {
				reset();
				this.props.history.push('/login');
				AlertActions.showSuccess(
					'login',
					'Password Has Been Reset',
					'Your password has been reset. You may now use your new password to log in.');
			})
			.catch(err => {
				if (err.status === 400) {
					return invalidate({
						newPassword: 'New password did not meet strength requirements.'
					});
				}

				AlertActions.handleErrorResponse(ALERT_KEY, err);
			})
			.finally(() => {
				this.setState(
					Object.assign(
						{},
						this.state,
						{ submitting: false }));
			});
	}

	render() {
		if (!this.state.user || !this.state.token) {
			return <NotFound />;
		}

		return (
			<div>
				<PageHeader heading="Change Your Password" alertKey={ ALERT_KEY } />
				<Grid>
					<Row>
						<Col xs={12} md={6}>
							Enter a new password for your account and then click <strong>Change Password</strong>
							&nbsp;to make the change.
						</Col>
					</Row>
					<Row>
						<Col xs={12} md={6}>
							<Formsy.Form className="form-horizontal" onValidSubmit={ this.submit }>
								<TextBox
									controlId="newPassword"
									name="newPassword"
									label="New password"
									validations={{
										matchRegexp: passwordStrengthRegex,
										minLength: 7,
										maxLength: 30
									}}
									validationErrors={{
										matchRegexp: 'Password is not strong enough. You must include letters, numbers and special characters.',
										minLength: 'Password must be at least seven characters long.',
										maxLength: 'Passwords cannot be longer than 30 characters.'
									}}
									isPassword
									required />
								<TextBox
									label="Retype password"
									controlId="confirmPassword"
									name="confirmPassword"
									validations={{
										equalsField: 'newPassword'
									}}
									validationErrors={{
										equalsField: 'Passwords must match.'
									}}
									isPassword
									required />
								{ this.state.submitting
									? <Spinner message="Changing password..." />
									: <Button type="submit" bsStyle="primary">Change Password</Button> }
							</Formsy.Form>
						</Col>
					</Row>
				</Grid>
			</div>);
	}
}

ConfirmPasswordReset.propTypes = {
	history: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired
};

export default withRouter(ConfirmPasswordReset);
