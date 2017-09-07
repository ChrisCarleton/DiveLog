import PageHeader from './controls/page-header.jsx';
import React from 'react';
import RequireAuth from './controls/require-auth.jsx';

const ALERT_KEY = 'admin';

class AdminDashboard extends React.Component {
	render() {
		return (
			<div>
				<RequireAuth requireAdmin />
				<PageHeader alertKey={ ALERT_KEY } heading="Admin Dashboard" />

				
			</div>);
	}
}

export default AdminDashboard;
