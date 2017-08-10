import React from 'react';

import {
	PageHeader
} from 'react-bootstrap';

class ServerError extends React.Component {
	render() {
		return (
			<div>
				<PageHeader>500: Server Error!</PageHeader>

				<p>
					{ 'Uh oh! We\'re sorry but something has gone wrong on our end. Please try again later '
						+ 'and if the problem persists please contact us at ' }
					<a href="mailto:admin@bottomtime.ca">admin@bottomtime.ca</a>
					{ ' and let us know what happened.' }
				</p>

				<p>
					We apologize for the inconvenience!
				</p>
			</div>);
	}
}

export default ServerError;
