import React from 'react';
import Navbar from './nav-bar.jsx';

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

export default Chrome;
