import { Decorator as FormsyElement } from 'formsy-react';
import React from 'react';
import PropTypes from 'prop-types';

import {
	ControlLabel,
	FormControl,
	FormGroup,
	HelpBlock
} from 'react-bootstrap';

@FormsyElement()
class TextBox extends React.Component {
	constructor(props) {
		super();
		this.state = {
			value: props.value || '',
			validationState: null
		};
		this.onTextChanged = this.onTextChanged.bind(this);
	}

	onTextChanged(e) {
		const state = this.getState();
		state.value = e.target.value;
		this.setState(state);
	}

	render() {
		return (
			<FormGroup controlId={this.props.controlId} validationState={this.state.validationState}>
				<ControlLabel>{this.props.label}</ControlLabel>
				<FormControl
					type="text"
					value={this.state.value}
					placeholder={this.props.placeholder}
					onChange={this.onTextChanged} />
				<FormControl.Feedback />
				<HelpBlock>Hi there!</HelpBlock>
			</FormGroup>);
	}
}

TextBox.propTypes = {
	controlId: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	placeholder: PropTypes.string,
	value: PropTypes.string
};

export default TextBox;
