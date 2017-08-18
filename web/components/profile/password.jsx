import Formsy from 'formsy-react';
import React from 'react';
import TextBox from '../controls/text-box.jsx';
import UserStore from '../../stores/user-store';

import {
	Button,
	Col,
	Row
} from 'react-bootstrap';

class Password extends React.Component {
	constructor() {
		super();
		this.state = {
			currentUser: null
		};
		this.onUserChanged = this.onUserChanged.bind(this);
		this.changePassword = this.changePassword.bind(this);
	}

	componentDidMount() {
		UserStore.listen(this.onUserChanged);
		this.onUserChanged();
	}

	componentWillUnmount() {
		UserStore.unlisten(this.onUserChanged);
	}

	onUserChanged() {
		this.setState(UserStore.getState());
	}

	changePassword(model) {
		console.log(model);
	}

	renderForUsersWithPasswords() {
		const passwordValidations = {
			matchRegexp: /(?=^[!@#$%^&*()_\-+=[{\]};:<>|./?a-zA-Z\d]{7,}$)(?=([!@#$%^&*()_\-+=[{\]};:<>|./?a-zA-Z\d]*\W+){1,})[!@#$%^&*()_\-+=[{\]};:<>|./?a-zA-Z\d]*$/,
			minLength: 7,
			maxLength: 30
		};
		const passwordValidationErrors = {
			matchRegexp: 'Password is not strong enough. You must include letters, numbers and special characters.',
			minLength: 'Password must be at least seven characters long.',
			maxLength: 'Passwords cannot be longer than 30 characters.'
		};
		return (
			<div>
				<p>
					Use the form below to change your password. Enter your current password to confirm your identity,
					and then enter your new password twice to confirm it.
				</p>
				<Formsy.Form className="form-horizontal" onValidSubmit={ this.changePassword }>
					<TextBox
						label="Current password"
						controlId="oldPassword"
						name="oldPassword"
						isPassword
						required />
					<TextBox
						label="New password"
						controlId="newPassword"
						name="newPassword"
						validations={ passwordValidations }
						validationErrors={ passwordValidationErrors }
						isPassword
						required />
					<TextBox
						label="Confirm password"
						controlId="confirmPassword"
						name="confirmPassword"
						validations={{ equalsField: 'newPassword' }}
						validationErrors={{ equalsField: 'Passwords must match.' }}
						isPassword
						required />

					<Row>
						<Col xsOffset={4} xs={8}>
							<Button type="submit" bsStyle="primary">Change Password</Button>
						</Col>
					</Row>
				</Formsy.Form>
			</div>);
	}

	renderForUsersWithoutPasswords() {
		return (
			<div>

			</div>);
	}

	render() {
		const currentUser = this.state.currentUser || { hasPassword: true };
		return (
			<div>
				<h3>Change Password</h3>
				{ currentUser.hasPassword
					? this.renderForUsersWithPasswords()
					: this.renderForUsersWithoutPasswords() }
			</div>);
	}
}

export default Password;
