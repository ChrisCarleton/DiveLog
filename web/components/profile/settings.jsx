import Formsy from 'formsy-react';
import React from 'react';

import {
	Button
} from 'react-bootstrap';

class Settings extends React.Component {
	submit(model) {
		console.log(model);
	}

	render() {
		return (
			<div>
				<h3>Settings</h3>
				<Formsy.Form className="form-horizontal" onValidSubmit={ this.submit }>
					<Button bsStyle="primary" type="submit">Save Changes</Button>
				</Formsy.Form>
			</div>);
	}
}

export default Settings;
