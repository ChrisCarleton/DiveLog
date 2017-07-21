import AlertActions from '../../actions/alert-actions';
import AlertStore from '../../stores/alert-store';
import React from 'react';
import PropTypes from 'prop-types';

import {
	Alert,
	PageHeader
} from 'react-bootstrap';

class MyPageHeader extends React.Component {
	constructor(props) {
		super();
		this.state =
			AlertStore.getState()[props.alertKey]
			|| { alertVisible: false };
		this.onStateChange = this.onStateChange.bind(this);
		this.dismissAlert = this.dismissAlert.bind(this);
	}

	componentDidMount() {
		AlertStore.listen(this.onStateChange);
		AlertActions.dismissAlert(this.props.alertKey);
	}

	componentWillUnmount() {
		AlertStore.unlisten(this.onStateChange);
	}

	dismissAlert() {
		AlertActions.dismissAlert(this.props.alertKey);
	}

	onStateChange() {
		this.setState(
			AlertStore.getState()[this.props.alertKey]
			|| { alertVisible: false });
	}

	renderAlert() {
		if (!this.state.alertVisible) {
			return null;
		}

		return (
			<Alert bsStyle={ this.state.alertStyle } onDismiss={ this.dismissAlert }>
				<h4>{ this.state.alertTitle }</h4>
				<p>{ this.state.alertDescription}</p>
			</Alert>);
	}

	render() {
		return (
			<div>
				<PageHeader>{ this.props.heading }</PageHeader>
				{ this.renderAlert() }
			</div>);
	}

}

MyPageHeader.propTypes = {
	alertKey: PropTypes.string.isRequired,
	heading: PropTypes.string.isRequired
};

export default MyPageHeader;