import { HOC } from 'formsy-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import {
	Col,
	ControlLabel,
	FormGroup
} from 'react-bootstrap';

class TimePicker extends React.Component {
	constructor() {
		super();

		this.hours = [];
		for (let i = 1; i <= 12; i++) {
			this.hours.push(<option key={i} value={i}>{i}</option>);
		}

		this.minutes = [];
		for (let i = 0; i < 60; i++) {
			let value = i.toString();
			if (value.length === 1) {
				value = '0' + value;
			}

			this.minutes.push(<option key={i} value={i}>{value}</option>);
		}

		this.onValueChanged = this.onValueChanged.bind(this);
	}

	onValueChanged(e) {
		const time = moment(this.props.getValue());
		const isPm = (time.format('a') === 'pm');
		let hour = time.hour();
		let minute = time.minute();

		switch (e.target.id) {
			case this.props.controlId + '_hours':
				hour = Number.parseInt(e.target.value) % 12;
				if (isPm) hour += 12;
				break;

			case this.props.controlId + '_minutes':
				minute = Number.parseInt(e.target.value);
				break;

			case this.props.controlId + '_ampm':
				if (e.target.value === 'am') hour -= 12;
				else hour += 12;
				break;
		}

		const value = time.hour(hour).minute(minute).toISOString();

		if (!this.props.onChange) {
			this.props.setValue(value);
		} else {
			this.props.onChange(value);
		}
	}

	render() {
		const time = moment(this.props.getValue());

		return (
			<FormGroup bsSize="small" validationState="success">
				<Col xs={4}>
					<ControlLabel className="right-aligned">
						{ this.props.label }
						<span className="text-danger"> * </span>
						{':'}
					</ControlLabel>
				</Col>
				<Col xs={8}>
					<select
						id={this.props.controlId + '_hours'}
						className="form-control time-picker-select"
						value={time.format('h')}
						onChange={this.onValueChanged}>
						{ this.hours }
					</select>
					<span className="time-picker-spacer">{' : '}</span>
					<select
						id={this.props.controlId + '_minutes'}
						className="form-control time-picker-select"
						value={time.format('m')}
						onChange={this.onValueChanged}>
						{ this.minutes }
					</select>
					<span className="time-picker-spacer">{' '}</span>
					<select
						id={this.props.controlId + '_ampm'}
						className="form-control time-picker-select"
						value={time.format('a')}
						onChange={this.onValueChanged}>
						<option key="am" value="am">am</option>
						<option key="pm" value="pm">pm</option>
					</select>
				</Col>
			</FormGroup>);
	}
}

TimePicker.propTypes = {
	controlId: PropTypes.string.isRequired,
	getValue: PropTypes.func.isRequired,
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func,
	setValue: PropTypes.func.isRequired
};

export default HOC(TimePicker);
