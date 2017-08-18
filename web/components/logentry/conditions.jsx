import CurrentEntryActions from '../../actions/current-entry-actions';
import PropTypes from 'prop-types';
import React from 'react';
import SelectBox from '../controls/select-box.jsx';

import {
	Col,
	Row
} from 'react-bootstrap';

class Conditions extends React.Component {
	constructor() {
		super();
		this.onSelectBoxChanged = this.onSelectBoxChanged.bind(this);
	}

	onSelectBoxChanged(id, value) {
		const update = {};
		update[id] = value;
		CurrentEntryActions.doPartialUpdate(update);
	}

	render() {
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
			</div>);
	}
}

Conditions.propTypes = {
	entry: PropTypes.object.isRequired
};

export default Conditions;
