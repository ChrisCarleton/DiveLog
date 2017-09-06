import AlertActions from '../../actions/alert-actions';
import DatePicker from '../controls/date-picker.jsx';
import Formsy from 'formsy-react';
import PropTypes from 'prop-types';
import React from 'react';
import request from '../../request-agent';
import SelectBox from '../controls/select-box.jsx';
import Spinner from '../controls/spinner.jsx';
import TextBox from '../controls/text-box.jsx';
import UserActions from '../../actions/user-actions';
import UserStore from '../../stores/user-store';

import {
	Button
} from 'react-bootstrap';

const ALERT_KEY = 'profile';

class GeneralInfo extends React.Component {
	constructor() {
		super();
		this.state = {
			currentUser: UserStore.getState().currentUser,
			isSaving: false
		};
		this.onUserChanged = this.onUserChanged.bind(this);
		this.submit = this.submit.bind(this);
	}

	componentDidMount() {
		UserStore.listen(this.onUserChanged);
		AlertActions.dismissAlert(ALERT_KEY);
	}

	componentWillUnmount() {
		UserStore.unlisten(this.onUserChanged);
	}

	onUserChanged() {
		this.setState({
			currentUser: UserStore.getState().currentUser,
			isSaving: this.state.isSaving
		});
	}

	submit(model, reset, invalidate) {
		AlertActions.dismissAlert(ALERT_KEY);
		this.setState({
			currentUser: this.state.currentUser,
			isSaving: true
		});

		model.numberOfDives = model.numberOfDives || null;
		model.diverType = model.diverType || null;

		request
			.put(`/api/users/${this.props.match.params.userName}/`)
			.send(model)
			.then(res => {
				if (this.state.currentUser.userName === this.props.match.params.userName) {
					UserActions.updateProfile(res.body);
				}

				AlertActions.showSuccess(
					ALERT_KEY,
					'Profile Saved',
					'Your profile information has been saved successfully.');
			})
			.catch(res => {
				if (res.status === 403) {
					// Attempt to change e-mail to one that already exists in the system.
					return invalidate({
						email: 'Unable to change e-mail address. This address is already taken!'
					});
				}

				AlertActions.handleErrorResponse(ALERT_KEY, res);
			})
			.finally(() => {
				this.setState({
					currentUser: this.state.currentUser,
					isSaving: false
				});
			});
	}

	render() {
		const user = this.state.currentUser;

		return (
			<div>
				<h3>My Info</h3>
				<p className="help-block">
					<strong>Note:</strong> Your profile information is not shared with or sold to anyone!
					You can control which users of this site can see your profile information using the Privacy tab.
					By default, your profile information and dive logs are private.
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
						placeholder="The e-mail address at which you prefer to be reached."
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
						label="Date of birth"
						value={ user.dateOfBirth } />
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
							maxLength: 150
						}}
						validationErrors={{
							maxLength: 'Certification agencies must be no more than 150 characters.'
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
						label="# of dives"
						value={ user.numberOfDives }>
						<option value=""></option>
						<option value="0">{ 'None yet! (I\'m new!)' }</option>
						<option value="<20">1-19</option>
						<option value="<50">20-49</option>
						<option value="<100">50-99</option>
						<option value="<500">100-499</option>
						<option value="<1000">500-999</option>
						<option value="<5000">1000-4999</option>
						<option value="<9000">5000-9000</option>
						<option value="9000+">{ 'IT\'S OVER 9000!!' }</option>
						<option value="unkown">{ 'I\'ve lost count!' }</option>
						<option value="no logs">Logging dives is for chumps!</option>
					</SelectBox>
					{ this.state.isSaving
						? <Spinner message="Saving..." />
						: <Button type="submit" bsStyle="primary">Save Changes</Button> }
				</Formsy.Form>
			</div>);
	}
}

GeneralInfo.propTypes = {
	match: PropTypes.object.isRequired
};

export default GeneralInfo;
