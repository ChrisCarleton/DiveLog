import React from 'react';
import Navbar from './nav-bar.jsx';
import PropTypes from 'prop-types';

class Chrome extends React.Component {
	render() {
		return (
			<div>
				<Navbar />
				<div className="container">
					{ this.props.children }
				</div>
			</div>);
	}
}

Chrome.propTypes = {
	children: PropTypes.node
};

export default Chrome;
