import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import {
	Checkbox,
	Col,
	ControlLabel,
	FormGroup,
	Row
} from 'react-bootstrap';

class Equipment extends React.Component {
	constructor() {
		super();
		this.equipment = ['Compass', 'Computer', 'Knife', 'Light', 'Scooter',
			'Slate', 'Surface marker'];
		this.onCheckboxUpdated = this.onCheckboxUpdated.bind(this);
	}

	onCheckboxUpdated() {

	}

	getBoolValue(key) {
		const entry = this.props.entry.equipment || {};

		if (!entry[key]) {
			return false;
		}

		return true;
	}

	render() {
		const checkboxes = _.map(this.equipment, e => {
			const camelCase = _.camelCase(e);
			return (
				<Checkbox
					id={camelCase}
					key={camelCase}
					checked={this.getBoolValue(camelCase)}
					onChange={this.onCheckboxUpdated}
					inline>
						{e}
				</Checkbox>);
		});

		return (
			<div>
				<Row>
					<Col xs={12}>
						<h4>Equipment</h4>
					</Col>
				</Row>
				<FormGroup bsSize="small">
					<Col xs={12}>
						<ControlLabel>Other equipment:</ControlLabel>
					</Col>
					<Col xs={12}>
						{checkboxes}
					</Col>
				</FormGroup>
			</div>);
	}
}

Equipment.propTypes = {
	entry: PropTypes.object.isRequired
};

export default Equipment;
