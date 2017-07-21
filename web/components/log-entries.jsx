import React from 'react';
import PageHeader from './controls/page-header.jsx';

class LogEntries extends React.Component {
	render() {
		return (
			<div>
				<PageHeader heading="Log Book" alertKey="log-book" />
			</div>);
	}
}

export default LogEntries;
