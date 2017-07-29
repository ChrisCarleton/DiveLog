import { Col, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import CurrentEntryActions from '../../actions/current-entry-actions';
import PropTypes from 'prop-types';
import React from 'react';

class Notes extends React.Component {
	onChanged(e) {
		CurrentEntryActions.doPartialUpdate({ notes: e.target.value });
	}

	render() {
		return (
			<FormGroup bsSize="small" controlId={this.props.controlId}>
				<Col xs={12}>
					<ControlLabel><h3>Notes</h3></ControlLabel>
					<FormControl
						componentClass="textarea"
						rows={8}
						value={this.props.value || ''}
						onChange={this.onChanged} />
				</Col>
			</FormGroup>);
	}
}

Notes.propTypes = {
	controlId: PropTypes.string.isRequired,
	value: PropTypes.string
};

export default Notes;
