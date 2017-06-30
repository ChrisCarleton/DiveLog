import { HOC } from 'formsy-react';
import React from 'react';
import PropTypes from 'prop-types';

import {
	ControlLabel,
	FormControl,
	FormGroup,
	HelpBlock
} from 'react-bootstrap';

class TextBox extends React.Component {
	constructor(props) {
		super();
		this.state = {
			validationState: null,
			value: props.value || ''
		};
		this.onTextChanged = this.onTextChanged.bind(this);
		this.onLostFocus = this.onLostFocus.bind(this);
	}

	onTextChanged(e) {
		this.props.setValue(e.target.value);
		const validationState = this.props.isValid() ? 'success' : 'error';
		this.setState(Object.assign(
			{},
			this.state,
			{
				value: e.target.value,
				validationState: validationState
			}));
	}

	onLostFocus() {
		this.props.setValue(this.state.value);
		const validationState = this.props.isValid() ? 'success' : 'error';
		this.setState(Object.assign({}, this.state, { validationState: validationState }));
	}

	render() {
		return (
			<FormGroup controlId={this.props.controlId} validationState={this.state.validationState}>
				<ControlLabel>{this.props.label}{":"}</ControlLabel>
				<FormControl
					type={this.props.isPassword ? 'password' : 'text'}
					value={this.state.value}
					placeholder={this.props.placeholder}
					onChange={this.onTextChanged}
					onBlur={this.onLostFocus} />
				<FormControl.Feedback />
				<HelpBlock>
					{
						this.props.showError()
						? this.props.getErrorMessage()
						: null
					}
				</HelpBlock>
				<HelpBlock>
					{
						(!this.props.isPristine() && this.props.showRequired())
						? this.props.label + ' is required.'
						: null
					}
				</HelpBlock>
				<HelpBlock>{this.props.helpText}</HelpBlock>
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
	label: PropTypes.string.isRequired,
	placeholder: PropTypes.string,
	setValue: PropTypes.func,
	showError: PropTypes.func,
	showRequired: PropTypes.func,
	value: PropTypes.string
};

export default HOC(TextBox);
