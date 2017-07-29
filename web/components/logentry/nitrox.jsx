import CurrentEntryActions from '../../actions/current-entry-actions';
import PropTypes from 'prop-types';
import React from 'react';
import TextBox from '../controls/text-box.jsx';

import {
	Col,
	Row
} from 'react-bootstrap';

class Nitrox extends React.Component {
	constructor() {
		super();
		this.onValueChanged = this.onValueChanged.bind(this);
	}

	onValueChanged(e) {
		if (e.target.id === 'cnsO2') {
			return CurrentEntryActions.doPartialUpdate({ cnsO2Percent: e.target.value });
		}

		const cylinder = this.props.entry.cylinders && this.props.entry.cylinders[0]
			? JSON.parse(JSON.stringify(this.props.entry.cylinders[0]))
			: {};

		if (cylinder.gas) {
			cylinder.gas.o2Percent = e.target.value;
		} else {
			cylinder.gas = { o2Percent: e.target.value };
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
						<h4>Nitrox</h4>
					</Col>
				</Row>
				<TextBox
					controlId="o2Percent"
					name="o2Percent"
					label="Oxygen content"
					value={ gas.o2Percent }
					unit="%"
					onChange={ this.onValueChanged }
					validations={{
						isBetween: { min: 5.0, max: 100.0 }
					}}
					validationErrors={{
						isBetween: 'Must be a valid number between 5 and 100%.'
					}}
					helpText="The percentage of oxygen in the gas blend. (E.g. EANx32 = 32%)" />
				<TextBox
					controlId="cnsO2"
					name="cnsO2"
					label="CNS O2"
					value={ this.props.entry.cnsO2Percent }
					unit="%"
					onChange={ this.onValueChanged }
					validations={{
						isBetween: { min: 0.0, max: 110.0 }
					}}
					validationErrors={{
						isBetween: 'Must be a valid number between 0 and 110%.'
					}}
					helpText="Central nervous system oxygen toxicity (as a percentage) after the dive." />
			</div>);
	}
}

Nitrox.propTypes = {
	entry: PropTypes.object.isRequired
};

export default Nitrox;
