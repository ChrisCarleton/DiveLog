import _ from 'lodash';
import { HOC } from 'formsy-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import {
	Col,
	ControlLabel,
	FormGroup,
	HelpBlock
} from 'react-bootstrap';

class TimePicker extends React.Component {
	constructor() {
		super();

		this.state = {
			hour: '',
			minute: '',
			ampm: 'am'
		};

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
		const currentState = Object.assign({}, this.state);
		switch (e.target.id) {
			case this.props.controlId + '_hours':
				currentState.hour = e.target.value;
				break;

			case this.props.controlId + '_minutes':
				currentState.minute = e.target.value;
				break;

			case this.props.controlId + '_ampm':
				currentState.ampm = e.target.value;
				break;
		}

		this.setState(currentState);

		if (!currentState.hour || !currentState.minute) {
			// Don't show the "Required Field" error until a value has been set or the form
			// has been submitted.
			if (this.props.isPristine()) return;

			return this.props.setValue(null);
		}

		let time = moment()
			.hour(currentState.hour)
			.minute(currentState.minute);

		if (currentState.ampm === 'pm') {
			time.add(12, 'h');
		}
			
		time = time.toISOString();
		this.props.setValue(time);

		if (this.props.onChange) {
			this.props.onChange(time);
		}
	}

	render() {
		const currentValue = this.props.getValue();
		let hour, minute, ampm, validationState, errorMessage;
		if (currentValue) {
			const time = moment(currentValue);
			hour = time.format('h');
			minute = time.format('m');
			ampm = time.format('a');
		} else {
			hour = this.state.hour;
			minute = this.state.minute;
			ampm = this.state.ampm;
		}
		const time = moment(this.props.getValue());
		const isValid = this.props.isValid();

		if (this.props.isPristine()) {
			validationState = null;
			errorMessage = null;
		} else if (this.props.required && (!this.state.hour || !this.state.minute)) {
			validationState = 'error';
			errorMessage = this.props.label + ' is required.';
		} else {
			validationState = isValid ? 'success' : 'error';
			errorMessage = isValid ? null : this.props.getErrorMessage();
		}

		return (
			<FormGroup bsSize="small" validationState={ validationState }>
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
						className="form-control"
						style={{ width: '20%', float: 'left' }}
						value={hour}
						onChange={this.onValueChanged}>
						<option value=""></option>
						{ this.hours }
					</select>
					<span className="time-picker-spacer">{' : '}</span>
					<select
						id={this.props.controlId + '_minutes'}
						className="form-control"
						style={{ width: '20%', float: 'left' }}
						value={minute}
						onChange={this.onValueChanged}>
						<option value=""></option>
						{ this.minutes }
					</select>
					<span className="time-picker-spacer">{' '}</span>
					<select
						id={this.props.controlId + '_ampm'}
						className="form-control"
						style={{ width: '20%', float: 'left' }}
						value={ampm}
						onChange={this.onValueChanged}>
						<option key="am" value="am">am</option>
						<option key="pm" value="pm">pm</option>
					</select>
					{ errorMessage ? <HelpBlock>{errorMessage}</HelpBlock> : null }
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
