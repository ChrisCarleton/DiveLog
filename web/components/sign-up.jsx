import AlertActions from '../actions/alert-actions';
import Formsy from 'formsy-react';
import PageHeader from './controls/page-header.jsx';
import React from 'react';
import { Redirect } from 'react-router-dom';
import TextBox from './controls/text-box.jsx';
import UserActions from '../actions/user-actions';
import UserStore from '../stores/user-store';

import {
	Button,
	Col,
	Row,
	Grid
} from 'react-bootstrap';

const ALERT_KEY = 'sign-up';

class SignUp extends React.Component {
	constructor() {
		super();
		this.state = {
			canSubmit: false,
			signedIn: UserStore.getState().currentUser ? true : false
		};
		this.enableButton = this.enableButton.bind(this);
		this.disableButton = this.disableButton.bind(this);
		this.onUserChanged = this.onUserChanged.bind(this);
	}

	componentDidMount() {
		UserStore.listen(this.onUserChanged);
	}

	componentWillUnmount() {
		UserStore.unlisten(this.onUserChanged);
	}

	onUserChanged(userInfo) {
		this.setState(Object.assign(
			{},
			this.state,
			{ signedIn: userInfo.currentUser ? true : false }));
	}

	enableButton() {
		this.setState(Object.assign({}, this.state, { canSubmit: true }));
	}

	disableButton() {
		this.setState(Object.assign({}, this.state, { canSubmit: false }));
	}

	submit(model) {
		AlertActions.dismissAlert(ALERT_KEY);
		UserActions.signUpUser(model);
	}

	render() {
		if (this.state.signedIn) {
			return <Redirect to="/" push />;
		}

		return (
			<div>
				<PageHeader heading="Sign Up" alertKey={ ALERT_KEY } />
				<Grid>
					<Row>
						<Col md={5}>
							<h4>Create an Account</h4>
							<Formsy.Form className="form-horizontal" onValidSubmit={ this.submit } onValid={ this.enableButton } onInvalid={ this.disableButton }>
								<TextBox
									label="User name"
									controlId="userName"
									name="userName"
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
								<TextBox
									label="Email"
									controlId="email"
									name="email"
									validations={{
										isEmail: true,
										maxLength: 150
									}}
									validationErrors={{
										isEmail: 'E-mail must be a valid e-mail address. (E.g. name@host.com)',
										maxLength: 'E-mail address must be 150 characters or less.'
									}}
									required />
								<TextBox
									label="Password"
									controlId="password"
									name="password"
									validations={{
										matchRegexp: /(?=^[!@#$%^&*()_\-+=[{\]};:<>|./?a-zA-Z\d]{7,}$)(?=([!@#$%^&*()_\-+=[{\]};:<>|./?a-zA-Z\d]*\W+){1,})[!@#$%^&*()_\-+=[{\]};:<>|./?a-zA-Z\d]*$/,
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
									label="Retype Password"
									controlId="confirmPassword"
									name="confirmPassword"
									isPassword
									validations={{
										equalsField: 'password'
									}}
									validationErrors={{
										equalsField: 'Passwords must match.'
									}}
									required />
								<Button type="submit" bsStyle="primary" disabled={!this.state.canSubmit}>
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
