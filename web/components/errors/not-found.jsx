import { Link } from 'react-router-dom';
import React from 'react';

import {
	PageHeader
} from 'react-bootstrap';

class NotFound extends React.Component {
	render() {
		return (
			<div>
				<PageHeader>Page not found!</PageHeader>

				<p>
					Sorry, the page you were looking for was not found. Try returning to the
					{ ' ' }<Link to="/">home page</Link> or using the navigation bar above to find
					what you are looking for.
				</p>
			</div>);
	}
}

export default NotFound;
