import { Link } from 'react-router-dom';
import React from 'react';
import UserStore from '../../stores/user-store';

import {
	PageHeader
} from 'react-bootstrap';

class EmailInUseError extends React.Component {
	constructor() {
		super();
		this.state = {
			currentUser: null
		};
		this.onUserChanged = this.onUserChanged.bind(this);
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

	render() {
		return (
			<div>
				<PageHeader>E-mail Address Already in Use</PageHeader>

				<p>
					The e-mail address belonging to this account is already registered with this site.
					If you already have an account with this site please log-in, access your profile page,
					and, under the OAuth settings, connect your desired OAuth providers to your account.
				</p>

				<p>
					We apologize for the inconvenience!
				</p>

				<ul>
					<li>
						<Link to="/">Return to home page</Link>
					</li>
					{
						this.state.currentUser
							? <li>
								<Link to={ `/profile/${this.state.currentUser.userName}` }>
									Manage profile
								</Link>
							</li>
							: null
					}
				</ul>
			</div>);
	}
}

export default EmailInUseError;
