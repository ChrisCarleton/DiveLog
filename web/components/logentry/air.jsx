import CurrentEntryActions from '../../actions/current-entry-actions';
import formUtils from '../../utils/form-utils';
import PropTypes from 'prop-types';
import React from 'react';
import TextBox from '../controls/text-box.jsx';

import {
	Col,
	ControlLabel,
	FormGroup,
	Radio,
	Row
} from 'react-bootstrap';

class Air extends React.Component {
	constructor() {
		super();
		this.onValueChanged = this.onValueChanged.bind(this);
	}

	onValueChanged(e) {
		const cylinder = this.props.entry.cylinders && this.props.entry.cylinders[0]
			? JSON.parse(JSON.stringify(this.props.entry.cylinders[0]))
			: {};
		if (!cylinder.gas) cylinder.gas = {};

		switch(e.target.id) {
			case 'capacity':
				cylinder.volume = formUtils.tryReturnAsNumber(e.target.value);
				break;

			case 'startPressure':
				cylinder.gas.startPressure = formUtils.tryReturnAsNumber(e.target.value);
				break;

			case 'endPressure':
				cylinder.gas.endPressure = formUtils.tryReturnAsNumber(e.target.value);
				break;

			default:
				if (e.target.name === 'tankType') {
					cylinder.type = e.target.value;
				}
				break;
		}

		CurrentEntryActions.updateCylinderInfo(0, cylinder);
	}

	render() {
		const entry = this.props.entry || {};
		let cylinder;
		if (entry.cylinders && entry.cylinders[0]) {
			cylinder = entry.cylinders[0];
		} else {
			cylinder = {};
		}

		const gas = cylinder.gas || {};

		return (
			<div>
				<Row>
					<Col xs={12}>
						<h4>Cylinder</h4>
					</Col>
				</Row>
				<TextBox
					controlId="capacity"
					name="capacity"
					label="Capacity"
					unit="cf"
					value={ cylinder.volume }
					onChange={ this.onValueChanged }
					validations={{
						isInteger: true,
						isPositive: true,
						max: 200
					}}
					validationErrors={{
						isInteger: 'Must be a whole number (no decimal places.)',
						isPositive: 'Must be a positive number.',
						max: 'Cylinder volume cannot be greater than 200cf.'
					}} />

				<FormGroup bsSize="small" validationState={ cylinder.type ? 'success' : null }>
					<Col xs={4}>
						<ControlLabel>Type:</ControlLabel>
					</Col>
					<Col xs={8}>
						<Radio
							name="tankType"
							value="aluminum"
							checked={ cylinder.type === 'aluminum' }
							onChange={ this.onValueChanged }
							inline>
								Aluminum
						</Radio>
						{' '}
						<Radio
							name="tankType"
							value="steel"
							checked={ cylinder.type === 'steel' }
							onChange={this.onValueChanged }
							inline>
								Steel
						</Radio>
					</Col>
				</FormGroup>

				<Row>
					<Col xs={12}>
						<h4>Pressure</h4>
					</Col>
				</Row>
				<TextBox
					controlId="startPressure"
					name="startPressure"
					label="Start"
					value={ gas.startPressure }
					onChange={ this.onValueChanged }
					unit="psi"
					validations={{
						isInteger: true,
						isPositive: true,
						max: 5000
					}}
					validationErrors={{
						isInteger: 'Must be a whole number (no decimal places.)',
						isPositive: 'Must be a positive number.',
						max: 'Starting pressure may not be greater than 5000psi.'
					}} />

				<TextBox
					controlId="endPressure"
					name="endPressure"
					label="End"
					value={ gas.endPressure }
					onChange={ this.onValueChanged }
					unit="psi"
					validations={{
						isInteger: true,
						isPositive: true,
						noMoreThan: 'startPressure'
					}}
					validationErrors={{
						isInteger: 'Must be a whole number (no decimal places.)',
						isPositive: 'Must be a positive number.',
						noMoreThan: 'Ending pressure cannot be greater than starting pressure.'
					}} />

			</div>);
	}
}

Air.propTypes = {
	entry: PropTypes.object.isRequired
};

export default Air;
