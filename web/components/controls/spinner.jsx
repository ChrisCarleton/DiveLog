import PropTypes from 'prop-types';
import React from 'react';

import { Media } from 'react-bootstrap';

class Spinner extends React.Component {
	render() {
		return (
			<Media>
				<Media.Left align="middle">
					<img src="/public/img/spinner.gif" alt="spinner" />
				</Media.Left>
				<Media.Body>
					{ this.props.message }
				</Media.Body>
			</Media>);
	}
}

Spinner.propTypes = {
	message: PropTypes.string
};

export default Spinner;
