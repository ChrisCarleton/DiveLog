import CurrentEntryActions from '../../actions/current-entry-actions';
import DecoStop from '../controls/deco-stop.jsx';
import PropTypes from 'prop-types';
import React from 'react';

import {
	Col,
	Row
} from 'react-bootstrap';

class DecoStops extends React.Component {
	constructor() {
		super();
		this.onDecoStopChanged = this.onDecoStopChanged.bind(this);
	}

	onDecoStopChanged(id, value) {
		const diveTime = JSON.parse(JSON.stringify(this.props.entry.diveTime || {}));
		if (!diveTime.decoStops) diveTime.decoStops = [];

		switch (id) {
			case 'safetyStop':
				diveTime.decoStops[0] = value;
				break;

			case 'stop2':
				diveTime.decoStops[1] = value;
				break;

			case 'stop1':
				diveTime.decoStops[2] = value;
				break;
		}

		CurrentEntryActions.doPartialUpdate({ diveTime: diveTime });
	}

	render() {
		const diveTime = this.props.entry.diveTime || {};
		const decoStops = diveTime.decoStops || [];
		const validations = { isDecoStop: true };
		const validationErrors = { isDecoStop: 'Depth and duration must be positive numbers.' };

		return (
			<div>
				<Row>
					<Col xs={12}>
						<h4>Deco Stops</h4>
					</Col>
				</Row>
				<DecoStop
					controlId="safetyStop"
					name="safetyStop"
					label="Safety stop"
					value={ decoStops[0] }
					validations={ validations }
					validationErrors={ validationErrors }
					onChange={ this.onDecoStopChanged } />
				<DecoStop
					controlId="stop2"
					name="stop2"
					label="Deco stop 2"
					value={ decoStops[1] }
					validations={ validations }
					validationErrors={ validationErrors }
					onChange={ this.onDecoStopChanged } />
				<DecoStop
					controlId="stop1"
					name="stop1"
					label="Deco stop 1"
					value={ decoStops[2] }
					validations={ validations }
					validationErrors={ validationErrors }
					onChange={ this.onDecoStopChanged } />
			</div>);
	}
}

DecoStops.propTypes = {
	entry: PropTypes.object.isRequired
};

export default DecoStops;
