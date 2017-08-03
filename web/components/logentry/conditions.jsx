import CurrentEntryActions from '../../actions/current-entry-actions';
import formUtils from '../../utils/form-utils';
import PropTypes from 'prop-types';
import React from 'react';
import SelectBox from '../controls/select-box.jsx';
import Textbox from '../controls/text-box.jsx';

import {
	Col,
	Row
} from 'react-bootstrap';

class Conditions extends React.Component {
	constructor() {
		super();
		this.onTemperatureChanged = this.onTemperatureChanged.bind(this);
		this.onSelectBoxChanged = this.onSelectBoxChanged.bind(this);
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

	onSelectBoxChanged(id, value) {
		let update = {};
		update[id] = value;
		CurrentEntryActions.doPartialUpdate(update);
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
				<SelectBox
					controlId="current"
					name="current"
					label="Current"
					onChange={ this.onSelectBoxChanged }
					value={ this.props.entry.current }>
						<option value=""></option>
						<option value="none">None</option>
						<option value="mild">Gentle</option>
						<option value="moderate">Moderate</option>
						<option value="fast">Fast</option>
						<option value="extreme">Weeeeeeee!!!</option>
				</SelectBox>
				<SelectBox
					controlId="visibility"
					name="visibility"
					label="Visibility"
					onChange={ this.onSelectBoxChanged }
					value={ this.props.entry.visibility }>
						<option value=""></option>
						<option value="none">None</option>
						<option value="poor">{ "Poor (<10')" }</option>
						<option value="moderate">{ "Decent (10'-30')" }</option>
						<option value="good">{ "Good (30'-60')" }</option>
						<option value="excellent">{ "Very good (60'-100')" }</option>
						<option value="ultra">{ "Crystal clear! (100'+)" }</option>
				</SelectBox>
				<SelectBox
					controlId="surfaceConditions"
					name="surfaceConditions"
					label="Surface cond's"
					onChange={ this.onSelectBoxChanged }
					value={ this.props.entry.surfaceConditions }>
						<option value=""></option>
						<option value="calm">Calm</option>
						<option value="moderate">Mild waves</option>
						<option value="rough">Rough</option>
						<option value="insane">Holy S***!</option>
				</SelectBox>
				<SelectBox
					controlId="weather"
					name="weather"
					label="Weather"
					onChange={ this.onSelectBoxChanged }
					value={ this.props.entry.weather }>
						<option value=""></option>
						<option value="sunny">Sunny</option>
						<option value="mainlySunny">Mainly sunny</option>
						<option value="overcast">Overcast</option>
						<option value="rainy">Rainy</option>
						<option value="stormy">Stormy</option>
				</SelectBox>
				<SelectBox
					controlId="mood"
					name="mood"
					label="Feeling"
					onChange={ this.onSelectBoxChanged }
					value={ this.props.entry.mood }>
						<option value=""></option>
						<option value="terrible">I hated this dive!</option>
						<option value="bad">Not good</option>
						<option value="ok">Good dive</option>
						<option value="good">Great dive</option>
						<option value="excellent">Best dive EVAH!!</option>
				</SelectBox>
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
