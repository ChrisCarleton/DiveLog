import _ from 'lodash';
import CurrentEntryActions from '../../actions/current-entry-actions';
import PropTypes from 'prop-types';
import React from 'react';

import {
	Checkbox,
	Col,
	ControlLabel,
	FormGroup,
	Radio,
	Row
} from 'react-bootstrap';

class DiveType extends React.Component {
	constructor() {
		super();
		this.diveTypes = ['Altitude', 'Cave', 'Deep', 'Drift', 'Ice', 'Night',
			'Reef', 'Search and Recovery', 'Training', 'Wreck'];
		this.onRadioUpdated = this.onRadioUpdated.bind(this);
		this.onCheckboxUpdated = this.onCheckboxUpdated.bind(this);
	}

	getBoolValue(diveType, key) {
		return !diveType[key] ? false : true;
	}

	onRadioUpdated(e) {
		const diveType = Object.assign({}, this.props.entry.diveType);

		switch (e.target.name) {
			case 'entryType':
				diveType.boat = (e.target.value === 'boat');
				break;

			case 'water':
				diveType.saltWater = (e.target.value === 'salt');
				break;
		}

		CurrentEntryActions.doPartialUpdate({ diveType: diveType });
	}

	onCheckboxUpdated(e) {
		const diveType = Object.assign({}, this.props.entry.diveType);
		diveType[e.target.id] = e.target.checked;
		CurrentEntryActions.doPartialUpdate({ diveType: diveType });
	}

	render() {
		const diveType = this.props.entry.diveType || {};
		const checkboxes = _.map(this.diveTypes, t => {
			const camelCase = _.camelCase(t);
			return (
				<Checkbox
					id={camelCase}
					key={camelCase}
					checked={this.getBoolValue(diveType, camelCase)}
					onChange={this.onCheckboxUpdated}
					inline>
					{t}
				</Checkbox>);
		});

		return (
			<div>
				<Row>
					<Col xs={12}>
						<h4>Dive Type</h4>
					</Col>
				</Row>
				<FormGroup bsSize="small" controlId="boatDive">
					<Col xs={3}>
						<ControlLabel className="right-aligned">Entry type:</ControlLabel>
					</Col>
					<Col xs={9}>
						<Radio
							id="boat"
							name="entryType"
							value="boat"
							checked={ this.getBoolValue(diveType, 'boat') }
							onChange={ this.onRadioUpdated }
							inline>
							Boat
						</Radio>
						<Radio
							id="shore"
							name="entryType"
							value="shore"
							checked={ !this.getBoolValue(diveType, 'boat') }
							onChange={ this.onRadioUpdated }
							inline>
							Shore
						</Radio>
					</Col>
				</FormGroup>
				<FormGroup bsSize="small" controlId="saltWater">
					<Col xs={3}>
						<ControlLabel className="right-aligned">Water:</ControlLabel>
					</Col>
					<Col xs={9}>
						<Radio
							id="salt"
							name="water"
							value="salt"
							checked={ this.getBoolValue(diveType, 'saltWater') }
							onChange={ this.onRadioUpdated }
							inline>
							Salt
						</Radio>
						<Radio
							id="fresh"
							name="water"
							value="fresh"
							checked={ !this.getBoolValue(diveType, 'saltWater') }
							onChange={ this.onRadioUpdated }
							inline>
							Fresh
						</Radio>
					</Col>
				</FormGroup>
				<FormGroup bsSize="small">
					<Col xs={3}>
						<ControlLabel className="right-aligned">Type of Dive:</ControlLabel>
					</Col>
					<Col xs={9}>
						{checkboxes}
					</Col>
				</FormGroup>
			</div>);
	}
}

DiveType.propTypes = {
	entry: PropTypes.object.isRequired
};

export default DiveType;
