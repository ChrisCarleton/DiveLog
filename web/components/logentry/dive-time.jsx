import CurrentEntryStore from '../../stores/current-entry-store';
import DatePicker from '../controls/date-picker.jsx';
import PropTypes from 'prop-types';
import React from 'react';
import TextBox from '../controls/text-box.jsx';

class DiveTime extends React.Component {
	constructor() {
		super();
		this.state = {};
		this.onStateChanged = this.onStateChanged.bind(this);
	}

	componentDidMount() {
		CurrentEntryStore.listen(this.onStateChanged);
	}

	componentWillUnmount() {
		CurrentEntryStore.unlisten(this.onStateChanged);
	}

	onStateChanged() {
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
					value={ this.props.entry.diveNumber } />
				<DatePicker
					controlId="entryDate"
					name="entryDate"
					label="Date"
					value={this.props.entry.entryTime}
					required />

				<TextBox
					controlId="entryTime"
					name="entryTime"
					label="Entry time"
					required />

				<TextBox
					controlId="diveLength"
					name="diveLength"
					label="Dive length"
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
					helpText="Bottom time is defined as the time span between the start of your descent to the start of your final ascent." />

				<TextBox
					controlId="surfaceInterval"
					name="surfaceInterval"
					label="Surface int."
					value={diveTime.surfaceInterval}
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
