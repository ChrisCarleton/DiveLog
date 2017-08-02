import _ from 'lodash';
import formUtils from '../../utils/form-utils';
import { HOC } from 'formsy-react';
import PropTypes from 'prop-types';
import React from 'react';

import {
	Col,
	ControlLabel,
	FormGroup,
	HelpBlock
} from 'react-bootstrap';

class DecoStop extends React.Component {
	constructor() {
		super();
		this.onValueChanged = this.onValueChanged.bind(this);
	}

	onValueChanged(e) {
		const currentValue = this.props.getValue() || {};

		switch (e.target.id) {
			case this.props.controlId + '_depth':
				currentValue.depth = formUtils.tryReturnAsNumber(e.target.value);
				break;

			case this.props.controlId + '_duration':
				currentValue.duration = formUtils.tryReturnAsNumber(e.target.value);
				break;
		}

		this.props.setValue(currentValue);
		if (this.props.onChange) this.props.onChange(this.props.controlId, currentValue);
	}

	render() {
		const value = this.props.getValue() || {};
		let validationState;
		if (this.props.isPristine()) {
			validationState = null;
		} else {
			validationState = this.props.isValid() ? 'success' : 'error';
		}

		return (
			<FormGroup bsSize="small" controlId={ this.props.controlId } validationState={ validationState }>
				<Col xs={4}>
					<ControlLabel>
						{ this.props.label }
						{ this.props.required ? <span className="text-danger"> * </span> : null }
						{ ':' }
					</ControlLabel>
				</Col>
				<Col xs={8}>
					<input
						id={ this.props.controlId + '_depth' }
						className="form-control deco-stop-text"
						onChange={ this.onValueChanged }
						value={ _.isNil(value.depth) ? '' : value.depth } />
					<span className="deco-stop-spacer">{ 'ft for ' }</span>
					<input
						id={ this.props.controlId + '_duration' }
						className="form-control deco-stop-text"
						onChange={ this.onValueChanged }
						value={ _.isNil(value.duration) ? '' : value.duration } />
					<span className="deco-stop-spacer">{ 'mins' }</span>
				</Col>
				<Col xs={8} xsOffset={4}>
					{ this.props.showError()
						? <HelpBlock>{ this.props.getErrorMessage() }</HelpBlock>
						: null }
				</Col>
			</FormGroup>);
	}
}

DecoStop.propTypes = {
	controlId: PropTypes.string.isRequired,
	getErrorMessage: PropTypes.func.isRequired,
	getValue: PropTypes.func.isRequired,
	isPristine: PropTypes.func.isRequired,
	isValid: PropTypes.func.isRequired,
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func,
	required: PropTypes.bool,
	setValue: PropTypes.func.isRequired,
	showError: PropTypes.func.isRequired,
	value: PropTypes.object
};

export default HOC(DecoStop);
