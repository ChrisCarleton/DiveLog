import PropTypes from 'prop-types';
import React from 'react';

import {
	Col,
	ControlLabel,
	FormControl,
	FormGroup
} from 'react-bootstrap';

class StaticField extends React.Component {
	render() {
		return (
			<FormGroup bsSize="small">
				<Col sm={3}>
					<ControlLabel className="right-aligned">
						<span className="text-right">
							{ this.props.label }{ ':' }
						</span>
					</ControlLabel>
				</Col>
				<Col sm={7}>
					<FormControl.Static>
						{ this.props.value }
					</FormControl.Static>
				</Col>
			</FormGroup>);
	}
}

StaticField.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.string
};

export default StaticField;
