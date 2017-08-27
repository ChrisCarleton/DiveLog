import AlertActions from '../actions/alert-actions';
import AlertStore from '../stores/alert-store';
import React from 'react';
import Navbar from './nav-bar.jsx';
import PropTypes from 'prop-types';

import { Button, Modal } from 'react-bootstrap';

class Chrome extends React.Component {
	constructor() {
		super();
		this.state =
			AlertStore.getState().global
			|| { alertVisible: false };
		this.onAlertsChanged = this.onAlertsChanged.bind(this);
		this.dismissAlert = this.dismissAlert.bind(this);
	}

	componentDidMount() {
		AlertStore.listen(this.onAlertsChanged);
	}

	componentWillUnmount() {
		AlertStore.unlisten(this.onAlertsChanged);
	}

	dismissAlert() {
		AlertActions.dismissAlert('global');
	}

	onAlertsChanged() {
		this.setState(
			AlertStore.getState().global
			|| { alertVisible: false });
	}

	renderGlobalAlert() {
		if (!this.state.alertVisible) {
			return null;
		}

		return (
			<Modal.Dialog>
				<Modal.Header>
					<Modal.Title>{ this.state.alertTitle }</Modal.Title>
				</Modal.Header>
				<Modal.Body>{ this.state.alertDescription }</Modal.Body>
				<Modal.Footer>
					<Button bsStyle="primary" onClick={ this.dismissAlert }>Ok</Button>
				</Modal.Footer>
			</Modal.Dialog>);
	}

	render() {
		return (
			<div>
				<Navbar />
				{ this.renderGlobalAlert() }
				<div className="container">
					{ this.props.children }
					<div className="text-right footer">
						<small><em>Copyright &copy; Chris Carleton, 2017</em></small>
					</div>
				</div>
			</div>);
	}
}

Chrome.propTypes = {
	children: PropTypes.node
};

export default Chrome;
