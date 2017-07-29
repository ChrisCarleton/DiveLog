import CurrentEntryActions from '../../actions/current-entry-actions';
import DatePicker from '../controls/date-picker.jsx';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import TextBox from '../controls/text-box.jsx';
import TimePicker from '../controls/time-picker.jsx';

class DiveTime extends React.Component {
	constructor(props) {
		super();

		const entry = props.entry || {};
		const entryTime = moment(entry.entryTime);
		this.state = {
			entryTime: entryTime.isValid() ? entryTime.format('h:mm a') : ''
		};

		this.onValueChanged = this.onValueChanged.bind(this);
		this.onEntryDateChanged = this.onEntryDateChanged.bind(this);
		this.onEntryTimeChanged = this.onEntryTimeChanged.bind(this);
	}

	onValueChanged(e) {
		const diveTime = this.props.entry.diveTime || {};
		let update;

		switch (e.target.id) {
			case 'diveNumber':
				return CurrentEntryActions.doPartialUpdate({ diveNumber: e.target.value });

			case 'diveLength':
				update = { diveLength: e.target.value };
				break;

			case 'bottomTime':
				update = { bottomTime: e.target.value };
				break;

			case 'surfaceInterval':
				update = { surfaceInterval: e.target.value };
				break;
		}

		CurrentEntryActions.doPartialUpdate({
			diveTime: Object.assign({}, diveTime, update)
		});
	}

	onEntryDateChanged(value) {
		if (!value) return;

		let time = this.props.entry.entryTime;
		if (!time) {
			return CurrentEntryActions.doPartialUpdate({ entryTime: value });
		}

		time = moment(time);
		CurrentEntryActions.doPartialUpdate({
			entryTime: moment(value)
				.hours(time.hours())
				.minutes(time.minutes())
				.seconds(time.seconds())
				.toISOString()
		});
	}

	onEntryTimeChanged(time) {
		CurrentEntryActions.doPartialUpdate({ entryTime: time });
	}

	render() {
		const diveTime = this.props.entry.diveTime || {};
		diveTime.decoStops = diveTime.decoStops || [];

		return (
			<div>
				<TextBox
					controlId="diveNumber"
					name="diveNumber"
					label="Dive #"
					validations={{
						isPositive: true,
						isInt: true
					}}
					validationErrors={{
						isPositive: 'Dive number must be a positive number.',
						isInt: 'Dive number must be a positive number with no decimal places!'
					}}
					onChange={ this.onValueChanged }
					value={ this.props.entry.diveNumber } />
				<DatePicker
					controlId="entryDate"
					name="entryDate"
					label="Date"
					onChange={ this.onEntryDateChanged }
					value={this.props.entry.entryTime}
					required />

				<TimePicker
					controlId="entryTime"
					name="entryTime"
					label="Entry time"
					value={this.props.entry.entryTime}
					onChange={ this.onEntryTimeChanged }
					required />

				<TextBox
					controlId="diveLength"
					name="diveLength"
					label="Dive length"
					unit="mins"
					onChange={ this.onValueChanged }
					value={diveTime.diveLength}
					placeholder="Total dive time in minutes"
					validations={{
						isInteger: true,
						isPositive: true
					}}
					validationErrors={{
						isInteger: 'Must be a whole number (no decimal places or seconds.)',
						isPositive: 'Must be a positive number.'
					}}
					required />

				<TextBox
					controlId="bottomTime"
					name="bottomTime"
					label="Bottom time"
					unit="mins"
					onChange={ this.onValueChanged }
					value={diveTime.bottomTime}
					placeholder="Bottom time in minutes"
					validations={{
						isInteger: true,
						isPositive: true
					}}
					validationErrors={{
						isInteger: 'Must be a whole number (no decimal places or seconds.)',
						isPositive: 'Must be a positive number.'
					}}
					helpText="Bottom time is defined as the number of minutes between the start of your descent and the start of your final ascent." />

				<TextBox
					controlId="surfaceInterval"
					name="surfaceInterval"
					label="Surf. interval"
					onChange={ this.onValueChanged }
					value={diveTime.surfaceInterval}
					unit="mins"
					placeholder="Surface interval in minutes"
					validations={{
						isInteger: true,
						isPositive: true
					}}
					validationErrors={{
						isInteger: 'Must be a whole number (no decimal places or seconds.)',
						isPositive: 'Must be a positive number.'
					}} />
			</div>);
	}
}

DiveTime.propTypes = {
	entry: PropTypes.object.isRequired
};

export default DiveTime;
