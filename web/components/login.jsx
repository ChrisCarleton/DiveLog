import AlertActions from '../actions/alert-actions';
import Formsy from 'formsy-react';
import PageHeader from './controls/page-header.jsx';
import React from 'react';
import { Redirect } from 'react-router-dom';
import SignInWithProvider from './controls/sign-in-with-provider.jsx';
import TextBox from './controls/text-box.jsx';
import UserActions from '../actions/user-actions';
import UserStore from '../stores/user-store';

import {
	Col,
	Button,
	Grid,
	Row
} from 'react-bootstrap';

const ALERT_KEY = 'login';

class LogIn extends React.Component {
	constructor() {
		super();
		const currentUser = UserStore.getState().currentUser;
		this.state = {
			signedIn: currentUser ? true : false
		};
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
			{ signedIn: userInfo.currentUser ? true :false }));
	}

	submit(model) {
		AlertActions.dismissAlert(ALERT_KEY);
		UserActions.loginUser(model);
	}

	render() {
		if (this.state.signedIn) {
			return <Redirect to="/" push />;
		}

		return (
		<div>
			<PageHeader heading="Log In" alertKey={ ALERT_KEY } />
			<Grid>
				<Row>
					<Col md={5}>
						<h4>Log In</h4>
						<Formsy.Form className="form-horizontal" onValidSubmit={ this.submit }>
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
						<SignInWithProvider />
					</Col>
				</Row>
			</Grid>
		</div>);
	}
}

export default LogIn;
