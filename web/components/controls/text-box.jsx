import _ from 'lodash';
import HelpBubble from './help-bubble.jsx';
import { HOC } from 'formsy-react';
import React from 'react';
import PropTypes from 'prop-types';

import {
	Col,
	ControlLabel,
	FormControl,
	FormGroup,
	HelpBlock
} from 'react-bootstrap';

class TextBox extends React.Component {
	constructor() {
		super();
		this.onTextChanged = this.onTextChanged.bind(this);
	}

	onTextChanged(e) {
		this.props.setValue(e.target.value);
	}

	render() {
		const isValid = this.props.isValid();
		let value = this.props.getValue();
		let validationState, errorMessage;

		value = _.isNil(value) ? '' : value;

		if (this.props.isPristine()) {
			validationState = null;
			errorMessage = null;
		} else if (!this.props.showRequired() && value === '') {
			validationState = null;
			errorMessage = null;
		} else if (this.props.showRequired()) {
			validationState = 'error';
			errorMessage = this.props.label + ' is required.';
		} else {
			validationState = isValid ? 'success' : 'error';
			errorMessage = isValid ? null : this.props.getErrorMessage();
		}

		return (
			<FormGroup bsSize="small" controlId={this.props.controlId} validationState={validationState}>
				<Col sm={4}>
					<ControlLabel>
						<span className="text-right">
							{this.props.label}
							{this.props.required ? <span className="text-danger"> * </span> : null}
							{':'}
						</span>
					</ControlLabel>
				</Col>
				<Col sm={7}>
					<FormControl
						type={this.props.isPassword ? 'password' : 'text'}
						value={value}
						placeholder={this.props.placeholder}
						onChange={this.props.onChange || this.onTextChanged} />
					<FormControl.Feedback />
					{ errorMessage ? <HelpBlock>{errorMessage}</HelpBlock> : null }
				</Col>
				<Col sm={1}>
					<span className="tb-unit">{ this.props.unit }</span>
					{ this.props.helpText
						? <div className="tb-help-bubble"><HelpBubble id={this.props.controlId + '_help'}>{this.props.helpText}</HelpBubble></div>
						: null }
				</Col>
			</FormGroup>);
	}
}

TextBox.propTypes = {
	controlId: PropTypes.string.isRequired,
	getErrorMessage: PropTypes.func,
	getValue: PropTypes.func,
	helpText: PropTypes.string,
	isPassword: PropTypes.bool,
	isPristine: PropTypes.func,
	isValid: PropTypes.func,
	label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
	placeholder: PropTypes.string,
	setValue: PropTypes.func,
	showError: PropTypes.func,
	showRequired: PropTypes.func,
	onChange: PropTypes.func,
	required: PropTypes.bool,
	unit: PropTypes.string
};

export default HOC(TextBox);
