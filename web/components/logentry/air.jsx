import CurrentEntryActions from '../../actions/current-entry-actions';
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
				cylinder.volume = e.target.value;
				break;

			case 'startPressure':
				cylinder.gas.startPressure = e.target.value;
				break;

			case 'endPressure':
				cylinder.gas.endPressure = e.target.value;
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
						isPositive: true
					}}
					validationErrors={{
						isInteger: 'Must be a whole number (no decimal places.)',
						isPositive: 'Must be a positive number.'
					}} />

				<FormGroup bsSize="small" validationState="success">
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
						isPositive: true
					}}
					validationErrors={{
						isInteger: 'Must be a whole number (no decimal places.)',
						isPositive: 'Must be a positive number.'
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
						isPositive: true
					}}
					validationErrors={{
						isInteger: 'Must be a whole number (no decimal places.)',
						isPositive: 'Must be a positive number.'
					}} />

			</div>);
	}
}

Air.propTypes = {
	entry: PropTypes.object.isRequired
};

export default Air;
