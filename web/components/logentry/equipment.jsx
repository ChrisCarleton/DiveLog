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
		this.onCheckboxChanged = this.onCheckboxChanged.bind(this);
		this.onSelectBoxChanged = this.onSelectBoxChanged.bind(this);
	}

	onCheckboxChanged(e) {
		const equipment = this.props.entry.equipment || {};
		equipment[e.target.id] = e.target.checked;
		CurrentEntryActions.doPartialUpdate({ equipment: equipment });
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

	getBoolValue(key) {
		const entry = this.props.entry.equipment || {};

		if (!entry[key]) {
			return false;
		}

		return true;
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
		const checkboxes = _.map(this.equipment, e => {
			const camelCase = _.camelCase(e);
			return (
				<Checkbox
					id={camelCase}
					key={camelCase}
					checked={this.getBoolValue(camelCase)}
					onChange={this.onCheckboxChanged}
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
