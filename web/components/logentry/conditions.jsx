import CurrentEntryActions from '../../actions/current-entry-actions';
import formUtils from '../../utils/form-utils';
import PropTypes from 'prop-types';
import React from 'react';
import Textbox from '../controls/text-box.jsx';

import {
	Col,
	Row
} from 'react-bootstrap';

class Conditions extends React.Component {
	constructor() {
		super();
		this.onTemperatureChanged = this.onTemperatureChanged.bind(this);
	}

	onTemperatureChanged(e) {
		const temperature = Object.assign({}, this.props.entry.temperature);

		switch (e.target.id) {
			case 'surfaceTemp':
				temperature.surface = formUtils.tryReturnAsNumber(e.target.value);
				break;

			case 'waterTemp':
				temperature.water = formUtils.tryReturnAsNumber(e.target.value);
				break;

			case 'thermocline1':
				temperature.thermocline1 = formUtils.tryReturnAsNumber(e.target.value);
				break;
		}

		CurrentEntryActions.doPartialUpdate({ temperature: temperature });
	}

	render() {
		const temperature = this.props.entry.temperature || {};

		return (
			<div>
				<Row>
					<Col xs={12}>
						<h4>Conditions</h4>
					</Col>
				</Row>
				<Row>
					<ul>
						<li>Current</li>
						<li>Visibility</li>
						<li>Surface conditions</li>
						<li>Weather</li>
						<li>Diver mood</li>
					</ul>
				</Row>
				<Row>
					<Col xs={12}>
						<h4>Temperature</h4>
					</Col>
				</Row>
				<Textbox
					controlId="surfaceTemp"
					name="surfaceTemp"
					label="At surface"
					unit="°F"
					value={ temperature.surface }
					validations={{
						isNumeric: true
					}}
					validationErrors={{
						isNumeric: 'Must be a number'
					}}
					onChange={ this.onTemperatureChanged } />

				<Textbox
					controlId="waterTemp"
					name="waterTemp"
					label="Below surface"
					unit="°F"
					value={ temperature.water }
					validations={{
						isNumeric: true
					}}
					validationErrors={{
						isNumeric: 'Must be a number'
					}}
					onChange={ this.onTemperatureChanged } />

				<Textbox
					controlId="thermocline1"
					name="thermocline1"
					label="Thermocline"
					unit="°F"
					value={ temperature.thermocline1 }
					validations={{
						isNumeric: true
					}}
					validationErrors={{
						isNumeric: 'Must be a number'
					}}
					onChange={ this.onTemperatureChanged } />
			</div>);
	}
}

Conditions.propTypes = {
	entry: PropTypes.object.isRequired
};

export default Conditions;
