import DatePicker from 'react-bootstrap-date-picker';
import { HOC } from 'formsy-react';
import PropTypes from 'prop-types';
import React from 'react';

import {
	Col,
	ControlLabel,
	FormGroup,
	HelpBlock
} from 'react-bootstrap';

class FormsyDatePicker extends React.Component {
	constructor() {
		super();
		this.onDateChanged = this.onDateChanged.bind(this);
	}

	onDateChanged(value) {
		this.props.setValue(value);
	}

	render() {
		const isValid = this.props.isValid();
		const value = this.props.getValue() || null;
		let validationState, errorMessage;

		if (this.props.isPristine()) {
			validationState = null;
			errorMessage = null;
		} else if (this.props.required && !value) {
			validationState = 'error';
			errorMessage = this.props.label + ' is required.';
		} else if (!this.props.required && !value) {
			validationState = null;
			errorMessage = null;
		} else {
			validationState = isValid ? 'success' : 'error';
			errorMessage = isValid ? null : this.props.getErrorMessage();
		}

		return (
			<FormGroup bsSize="small" controlId={this.props.controlId} validationState={validationState}>
				<Col xs={4}>
					<ControlLabel>
							{this.props.label}
							{this.props.required ? <span className="text-danger"> * </span> : null}
							{":"}
					</ControlLabel>
				</Col>
				<Col xs={7}>
					<DatePicker
						value={value}
						onChange={this.props.onChange || this.onDateChanged}
						showTodayButton />
					{ errorMessage ? <HelpBlock>{errorMessage}</HelpBlock> : null }
				</Col>
			</FormGroup>);
	}
}

FormsyDatePicker.propTypes = {
	controlId: PropTypes.string.isRequired,
	getErrorMessage: PropTypes.func.isRequired,
	getValue: PropTypes.func.isRequired,
	isPristine: PropTypes.func.isRequired,
	isValid: PropTypes.func.isRequired,
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func,
	required: PropTypes.bool,
	setValue: PropTypes.func.isRequired
};

export default HOC(FormsyDatePicker);
