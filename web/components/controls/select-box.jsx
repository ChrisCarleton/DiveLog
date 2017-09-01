import { HOC } from 'formsy-react';
import PropTypes from 'prop-types';
import React from 'react';

import {
	Col,
	ControlLabel,
	FormControl,
	FormGroup
} from 'react-bootstrap';

class SelectBox extends React.Component {
	constructor() {
		super();
		this.onChanged = this.onChanged.bind(this);
	}

	onChanged(e) {
		this.props.setValue(e.target.value);
		if (this.props.onChange) this.props.onChange(this.props.controlId, e.target.value);
	}

	render() {
		const value = this.props.getValue() || '';
		let validationState;
		if (this.props.isPristine()) {
			validationState = null;
		} else {
			validationState = this.props.isValid() ? 'success' : 'error';
		}

		return (
			<FormGroup controlId={this.props.controlId} bsSize="small" validationState={ validationState }>
				<Col sm={3}>
					<ControlLabel className="right-aligned">
						{this.props.label}
						{this.props.required ? <span className="text-danger"> * </span> : null}
						{':'}
					</ControlLabel>
				</Col>
				<Col sm={7}>
					<FormControl componentClass="select" value={ value } onChange={ this.onChanged }>
						{ this.props.children }
					</FormControl>
				</Col>
			</FormGroup>);
	}
}

SelectBox.propTypes = {
	children: PropTypes.node.isRequired,
	controlId: PropTypes.string.isRequired,
	getValue: PropTypes.func.isRequired,
	isPristine: PropTypes.func.isRequired,
	isValid: PropTypes.func.isRequired,
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func,
	required: PropTypes.bool,
	setValue: PropTypes.func.isRequired
};

export default HOC(SelectBox);
