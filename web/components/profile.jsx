import PageHeader from './controls/page-header.jsx';
import React from 'react';

const ALERT_KEY = 'profile';

class Profile extends React.Component {
	render() {
		return (
			<div>
				<PageHeader heading="Profile" alertKey={ ALERT_KEY } />
			</div>);
	}
}

export default Profile;
