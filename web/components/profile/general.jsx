import DatePicker from '../controls/date-picker.jsx';
import Formsy from 'formsy-react';
import moment from 'moment';
import React from 'react';
import SelectBox from '../controls/select-box.jsx';
import TextBox from '../controls/text-box.jsx';
import UserStore from '../../stores/user-store';

import {
	Button
} from 'react-bootstrap';

class GeneralInfo extends React.Component {
	constructor() {
		super();
		this.state = UserStore.getState();
		this.onUserChanged = this.onUserChanged.bind(this);
	}

	componentDidMount() {
		UserStore.listen(this.onUserChanged);
	}

	componentWillUnmount() {
		UserStore.unlisten(this.onUserChanged);
	}

	onUserChanged() {
		this.setState(UserStore.getState());
	}

	submit(model) {
		console.log(model);
	}

	render() {
		const user = this.state.currentUser;

		return (
			<div>
				<h3>My Info</h3>
				<p className="help-block">
					<strong>Note:</strong> Your profile information is not shared with or sold to anyone not directly affiliated with this site.
					You can control which users of this site can see your profile information using the Privacy tab.
				</p>
				<Formsy.Form className="form-horizontal" onValidSubmit={ this.submit }>
					<TextBox
						controlId="displayName"
						name="displayName"
						label="Display name"
						placeholder="Your full name as you would like it to appear on the site."
						value={ user.displayName }
						validations={{
							maxLength: 100
						}}
						validationErrors={{
							maxLength: 'Display name can be no more than 100 characters.'
						}}
						required />
					<TextBox
						controlId="email"
						name="email"
						label="Email address"
						value={ user.email }
						required
						validations={{
							isEmail: true,
							maxLength: 150
						}}
						validationErrors={{
							isEmail: 'Must be a valid e-mail address',
							maxLength: 'E-mail address can be no more than 150 characters.'
						}} />
					<DatePicker
						controlId="dateOfBirth"
						name="dateOfBirth"
						label="Date of birth" />
					<TextBox
						controlId="location"
						name="location"
						label="Location"
						placeholder="Where do you live? (City, region, etc.)"
						value={ user.location }
						validations={{
							maxLength: 150
						}}
						validationErrors={{
							maxLength: 'Location can be no more than 150 characters.'
						}} />
					<TextBox
						controlId="certificationAgencies"
						name="certificationAgencies"
						label="Certification agencies"
						placeholder="Which agences have you received training from? (PADI, NAUI, etc.)"
						value={ user.certificationAgencies }
						validations={{
							maxLength: 250
						}}
						validationErrors={{
							maxLength: 'Certification agencies must be no more than 250 characters.'
						}} />
					<SelectBox
						controlId="diverType"
						name="diverType"
						label="Type of diver"
						value={ user.diverType }>
						<option value=""></option>
						<option value="novice">Beginner or newly-certified</option>
						<option value="vacation">Vacation or occasional diver</option>
						<option value="typical">Just a typical diver</option>
						<option value="advanced">Experienced / advanced diver</option>
						<option value="tech">Tech diver</option>
						<option value="commercial">Commercial diver</option>
						<option value="divemaster">Divemaster</option>
						<option value="instructor">Dive instructor / trainer</option>
					</SelectBox>
					<SelectBox
						controlId="numberOfDives"
						name="numberOfDives"
						label="# of dives">
						<option value=""></option>
						<option value="0">None yet! (I'm new!)</option>
						<option value="<20">1-19</option>
						<option value="<50">20-49</option>
						<option value="<100">50-99</option>
						<option value="<500">100-499</option>
						<option value="<1000">500-999</option>
						<option value="<5000">1000-4999</option>
						<option value="<9000">5000-9000</option>
						<option value="9000+">IT'S OVER 9000!!</option>
						<option value="unkown">I've lost count!</option>
						<option value="no logs">Logging dives is for chumps!</option>
					</SelectBox>
					<Button type="submit" bsStyle="primary">Save Changes</Button>
				</Formsy.Form>
			</div>);
	}
}

export default GeneralInfo;
