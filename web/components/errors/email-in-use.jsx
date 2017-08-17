import React from 'react';

import {
	PageHeader
} from 'react-bootstrap';

class EmailInUseError extends React.Component {
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
			</div>);
	}
}

export default EmailInUseError;
