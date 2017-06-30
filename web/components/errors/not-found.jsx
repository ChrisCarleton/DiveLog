import React from 'react';

import {
	PageHeader
} from 'react-bootstrap';

class NotFound extends React.Component {
	render() {
		return (
			<div>
				<PageHeader>404! <small>(Page not found)</small></PageHeader>

				<p>
					Sorry, the page you were looking for was not found.
				</p>
			</div>);
	}
}

export default NotFound;
