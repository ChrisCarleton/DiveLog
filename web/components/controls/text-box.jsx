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
		this.state.value = e.target.value;
		this.setState(this.state);
	}

	onLostFocus() {
		this.props.setValue(this.state.value);
		this.state.validationState = this.props.isValid() ? 'success' : 'error';
		this.setState(this.state);
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
				<HelpBlock>{this.props.helpText}</HelpBlock>
			</FormGroup>);
	}
}

TextBox.propTypes = {
	controlId: PropTypes.string.isRequired,
	helpText: PropTypes.string,
	isPassword: PropTypes.bool,
	label: PropTypes.string.isRequired,
	placeholder: PropTypes.string,
	value: PropTypes.string
};

export default HOC(TextBox);
