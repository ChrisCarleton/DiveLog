import AlertActions from '../../actions/alert-actions';
import AlertStore from '../../stores/alert-store';
import React from 'react';

import {
	Alert
} from 'react-bootstrap';

class AlertBox extends React.Component {
	constructor() {
		super();
		this.state = AlertStore.getState();
		this.onStateChange = this.onStateChange.bind(this);
	}

	componentDidMount() {
		AlertStore.listen(this.onStateChange);
	}

	componentWillUnmount() {
		AlertStore.unlisten(this.onStateChange);
	}

	dismissAlert() {
		AlertActions.dismissAlert();
	}

	onStateChange() {
		this.setState(AlertStore.getState());
	}

	render() {
		if (!this.state.alertVisible) {
			return null;
		}

		return (
			<Alert bsStyle={ this.state.alertStyle } onDismiss={ this.dismissAlert }>
				<h4>{ this.state.title }</h4>
				<p>{ this.state.description }</p>
			</Alert>);
	}
}

export default AlertBox;
