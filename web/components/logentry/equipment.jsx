import _ from 'lodash';
import CurrentEntryActions from '../../actions/current-entry-actions';
import formUtils from '../../utils/form-utils';
import PropTypes from 'prop-types';
import React from 'react';
import SelectBox from '../controls/select-box.jsx';

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
		this.exposureGear = ['Boots', 'Gloves', 'Hood'];
		this.onEquipmentCheckboxChanged = this.onEquipmentCheckboxChanged.bind(this);
		this.onExposureCheckboxChanged = this.onExposureCheckboxChanged.bind(this);
		this.onSelectBoxChanged = this.onSelectBoxChanged.bind(this);
	}

	onEquipmentCheckboxChanged(e) {
		const equipment = this.props.entry.equipment || {};
		equipment[e.target.id] = e.target.checked;
		CurrentEntryActions.doPartialUpdate({ equipment: equipment });
	}

	onExposureCheckboxChanged(e) {
		const exposure = this.props.entry.exposure || {};
		exposure[e.target.id] = e.target.checked;
		CurrentEntryActions.doPartialUpdate({ exposure: exposure });
	}

	onSelectBoxChanged(id, value) {
		const exposure = this.props.entry.exposure || {};

		switch (id) {
			case 'exposure':
				exposure.body = value;
				if (value !== 'shorty' && value !== 'full') {
					exposure.thickness = undefined;
				}
				break;

			case 'thickness':
				exposure.thickness = formUtils.tryReturnAsNumber(value);
				break;
		}

		CurrentEntryActions.doPartialUpdate({ exposure: exposure });
	}

	getThicknessSelectBox(exposure) {
		if (exposure.body === 'shorty' || exposure.body === 'full') {
			return (
				<SelectBox
					controlId="thickness"
					name="thickness"
					label="Thickness"
					onChange={ this.onSelectBoxChanged }
					value={ exposure.thickness }>
					<option value=""></option>
					<option value="3">3mm</option>
					<option value="5">5mm</option>
					<option value="7">7mm</option>
				</SelectBox>);
		}

		return null;
	}

	render() {
		const exposure = this.props.entry.exposure || {};
		const equipment = this.props.entry.equipment || {};
		const equipmentCheckboxes = _.map(this.equipment, e => {
			const camelCase = _.camelCase(e);
			return (
				<Checkbox
					id={camelCase}
					key={camelCase}
					checked={equipment[camelCase] ? true : false}
					onChange={this.onEquipmentCheckboxChanged}
					inline>
					{e}
				</Checkbox>);
		});

		const exposureCheckboxes = _.map(this.exposureGear, e => {
			const camelCase = _.camelCase(e);
			return (
				<Checkbox
					id={camelCase}
					key={camelCase}
					checked={exposure[camelCase] ? true : false}
					onChange={this.onExposureCheckboxChanged}
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
				<SelectBox
					controlId="exposure"
					name="exposure"
					label="Exposure suit"
					onChange={ this.onSelectBoxChanged }
					value={ exposure.body }>
					<option value=""></option>
					<option value="none">None</option>
					<option value="shorty">Shorty</option>
					<option value="full">Full-Length Wetsuit</option>
					<option value="dry">Dry suit</option>
				</SelectBox>
				{ this.getThicknessSelectBox(exposure) }
				<FormGroup bsSize="small">
					<Col xs={3}>
						<ControlLabel className="right-aligned">Also wearing:</ControlLabel>
					</Col>
					<Col xs={9}>
						{exposureCheckboxes}
					</Col>
				</FormGroup>
				<FormGroup bsSize="small">
					<Col xs={3}>
						<ControlLabel className="right-aligned">Other:</ControlLabel>
					</Col>
					<Col xs={9}>
						{equipmentCheckboxes}
					</Col>
				</FormGroup>
			</div>);
	}
}

Equipment.propTypes = {
	entry: PropTypes.object.isRequired
};

export default Equipment;
