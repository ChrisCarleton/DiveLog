import PageHeader from './controls/page-header.jsx';
import React from 'react';

class LogEntry extends React.Component {

	render() {
		return (
			<div>
				<PageHeader heading="Log Entry" alertKey="log-entry" />
			</div>);
	}
}

export default LogEntry;
