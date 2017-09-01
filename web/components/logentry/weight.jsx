import CurrentEntryActions from '../../actions/current-entry-actions';
import formUtils from '../../utils/form-utils';
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

class Weight extends React.Component {
	constructor() {
		super();
		this.onValueChanged = this.onValueChanged.bind(this);
	}

	onValueChanged(e) {
		const weight = this.props.entry.weight
			? Object.assign({}, this.props.entry.weight)
			: {};

		if (e.target.id === 'weight') {
			weight.amount = formUtils.tryReturnAsNumber(e.target.value);
		} else {
			switch (e.target.name) {
				case 'weight':
					weight.correctness = e.target.value;
					break;

				case 'trim':
					weight.trim = e.target.value;
					break;
			}
		}

		CurrentEntryActions.doPartialUpdate({ weight: weight });
	}

	render() {
		const weight = this.props.entry.weight || {};

		return (
			<div>
				<Row>
					<Col xs={12}>
						<h4>Weight</h4>
					</Col>
				</Row>
				<TextBox
					controlId="weight"
					name="weight"
					label="Weight"
					unit="lbs"
					value={ weight.amount }
					onChange={ this.onValueChanged }
					validations={{
						isPositive: true,
						max: 100
					}}
					validationErrors={{
						isPositive: 'Must be a positive number.',
						max: 'Weight can be set to no more than 100lbs.'
					}} />

				<FormGroup bsSize="small" validationState={ weight.correctness ? 'success' : null }>
					<Col xs={3}>
						<ControlLabel className="right-aligned">Correct Amount?</ControlLabel>
					</Col>
					<Col xs={9}>
						<Radio
							name="weight"
							value="good"
							checked={ weight.correctness === 'good' }
							inline
							onChange={ this.onValueChanged }>
								Good
						</Radio>
						<Radio
							name="weight"
							value="too much"
							checked={ weight.correctness === 'too much' }
							inline
							onChange={ this.onValueChanged }>
								Too much
						</Radio>
						<Radio
							name="weight"
							value="too little"
							checked={ weight.correctness === 'too little' }
							inline
							onChange={ this.onValueChanged }>
								Too little
						</Radio>
					</Col>
				</FormGroup>

				<FormGroup bsSize="small" validationState={ weight.trim ? 'success' : null }>
					<Col xs={3}>
						<ControlLabel className="right-aligned">Trim:</ControlLabel>
					</Col>
					<Col xs={9}>
						<Radio
							name="trim"
							value="good"
							checked={ weight.trim === 'good' }
							inline
							onChange={ this.onValueChanged }>
								Good
						</Radio>
						<Radio
							name="trim"
							value="feet down"
							checked={ weight.trim === 'feet down' }
							inline
							onChange={ this.onValueChanged }>
								Feet down
						</Radio>
						<Radio
							name="trim"
							value="head down"
							checked={ weight.trim === 'head down' }
							inline
							onChange={ this.onValueChanged }>
								Head down
						</Radio>
					</Col>
				</FormGroup>
			</div>);
	}
}

Weight.propTypes = {
	entry: PropTypes.object.isRequired
};

export default Weight;
