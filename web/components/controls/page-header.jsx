import AlertActions from '../../actions/alert-actions';
import AlertStore from '../../stores/alert-store';
import React from 'react';
import PropTypes from 'prop-types';
import scrollToElement from 'scroll-to-element';

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
		this.hasScrolled = false;

		this.onStateChange = this.onStateChange.bind(this);
		this.dismissAlert = this.dismissAlert.bind(this);
		this.getSubHeading = this.getSubHeading.bind(this);
	}

	componentDidMount() {
		AlertStore.listen(this.onStateChange);
		AlertActions.dismissAlert(this.props.alertKey);
	}

	componentDidUpdate() {
		if (this.state.alertVisible && !this.hasScrolled) {
			scrollToElement('#alert-well', { duration: 500, offset: -70 });
			this.hasScrolled = true;
		}
	}

	componentWillUnmount() {
		AlertStore.unlisten(this.onStateChange);
	}

	dismissAlert() {
		AlertActions.dismissAlert(this.props.alertKey);
	}

	onStateChange() {
		this.hasScrolled = false;
		this.setState(
			AlertStore.getState()[this.props.alertKey]
			|| { alertVisible: false });
	}

	getSubHeading() {
		if (!this.props.subHeading) {
			return null;
		}

		return <small><br />{ this.props.subHeading }</small>;
	}

	renderAlert() {
		if (!this.state.alertVisible) {
			return null;
		}

		return (
			<div>
				<a id="alert-well"></a>
				<Alert bsStyle={ this.state.alertStyle } onDismiss={ this.dismissAlert }>
					<h4>{ this.state.alertTitle }</h4>
					<p>{ this.state.alertDescription}</p>
				</Alert>
			</div>);
	}

	render() {
		return (
			<div>
				<PageHeader>{ this.props.heading }{ this.getSubHeading() }</PageHeader>
				{ this.renderAlert() }
			</div>);
	}

}

MyPageHeader.propTypes = {
	alertKey: PropTypes.string.isRequired,
	heading: PropTypes.string.isRequired,
	subHeading: PropTypes.string
};

export default MyPageHeader;
