import Air from './logentry/air.jsx';
import AlertActions from '../actions/alert-actions';
import Conditions from './logentry/conditions.jsx';
import ConfirmDialog from './controls/confirm-dialog.jsx';
import CurrentEntryActions from '../actions/current-entry-actions';
import CurrentEntryStore from '../stores/current-entry-store';
import DecoStops from './logentry/deco-stops.jsx';
import DiveType from './logentry/dive-type.jsx';
import Equipment from './logentry/equipment.jsx';
import Formsy from 'formsy-react';
import { IndexLinkContainer } from 'react-router-bootstrap';
import DiveLocation from './logentry/location.jsx';
import DiveTime from './logentry/dive-time.jsx';
import Nitrox from './logentry/nitrox.jsx';
import Notes from './logentry/notes.jsx';
import NotFound from './errors/not-found.jsx';
import PageHeader from './controls/page-header.jsx';
import PropTypes from 'prop-types';
import React from 'react';
import RequireAuth from './controls/require-auth.jsx';
import ServerError from './errors/server-error.jsx';
import SiteMap from './logentry/site-map.jsx';
import Temperature from './logentry/temperature.jsx';
import Weight from './logentry/weight.jsx';
import { withRouter } from 'react-router';

import {
	Breadcrumb,
	Button,
	Col,
	Grid,
	Row
} from 'react-bootstrap';

class LogEntry extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: props.match.params.logId ? 'Edit Log Entry' : 'Create New Entry',
			isSaving: false,
			currentEntry: {},
			showConfirmReset: false
		};

		this.onStateChanged = this.onStateChanged.bind(this);
		this.submit = this.submit.bind(this);
		this.showConfirmReset = this.showConfirmReset.bind(this);
		this.hideConfirmReset = this.hideConfirmReset.bind(this);
		this.confirmReset = this.confirmReset.bind(this);
		this.reset = this.reset.bind(this);
	}

	componentDidMount() {
		CurrentEntryStore.listen(this.onStateChanged);
		this.reset();
	}

	componentWillUnmount() {
		CurrentEntryStore.unlisten(this.onStateChanged);
	}

	onStateChanged() {
		this.setState(Object.assign(
			{},
			this.state,
			CurrentEntryStore.getState()));
	}

	confirmReset() {
		this.reset();
		this.hideConfirmReset();
	}

	showConfirmReset() {
		this.setState(
			Object.assign(
				{},
				this.state,
				{ showConfirmReset: true } ));
	}

	hideConfirmReset() {
		this.setState(
			Object.assign(
				{},
				this.state,
				{ showConfirmReset: false } ));
	}

	reset() {
		const params = this.props.match.params;
		if (params.logId) {
			CurrentEntryActions.fetchLogEntry(
				params.userName,
				params.logId);
		} else {
			CurrentEntryActions.clearEntry();
		}
	}

	submit() {
		const params = this.props.match.params;
		if (params.logId) {
			CurrentEntryActions.saveEntry(
				params.userName,
				params.logId,
				this.state.currentEntry);
		} else {
			CurrentEntryActions.createEntry(
				params.userName,
				this.state.currentEntry,
				this.props.history);
		}
	}

	onValidationFailed() {
		AlertActions.showError(
			'log-entry',
			'There were problems with your submission',
			'Please check the values below and then re-submit.');
	}

	render() {
		if (this.state.currentEntry === 'not found') {
			return <NotFound />;
		}

		if (this.state.currentEntry === 'server error') {
			return <ServerError />;
		}

		return (
			<div>
				<RequireAuth />
				<Breadcrumb>
					<IndexLinkContainer to="/">
						<Breadcrumb.Item>Home</Breadcrumb.Item>
					</IndexLinkContainer>
					<IndexLinkContainer to={ `/logbook/${this.props.match.params.userName}` }>
						<Breadcrumb.Item>Log Book</Breadcrumb.Item>
					</IndexLinkContainer>
					<Breadcrumb.Item active>{ this.state.title }</Breadcrumb.Item>
				</Breadcrumb>
				<PageHeader heading={ this.state.title } alertKey="log-entry" />
				<Formsy.Form className="form-horizontal" onValidSubmit={ this.submit } onInvalidSubmit={ this.onValidationFailed }>
					<Grid>
						<Row>
							<Col xs={12}>
								<h3>Time and Location</h3>
							</Col>
						</Row>
						<Row>
							<Col xs={12} md={4}>
								<DiveTime entry={ this.state.currentEntry } />
							</Col>
							<Col xs={12} md={4}>
								<DiveLocation entry={ this.state.currentEntry } />
							</Col>
							<Col xsHidden md={4}>
								<SiteMap
									containerElement={
										<div style={{ height: '280px' }} />
									}
									mapElement={
										<div style={{ height: '100%' }} />
									}
									site={ this.state.currentEntry.site }
									gps={ this.state.currentEntry.gps } />
							</Col>
						</Row>
						<Row>
							<Col xs={12}>
								<h3>Air and Weight</h3>
							</Col>
						</Row>
						<Row>
							<Col xs={12} md={4}>
								<Weight entry={ this.state.currentEntry } />
							</Col>
							<Col xs={12} md={4}>
								<Air entry={ this.state.currentEntry } />
							</Col>
							<Col xs={12} md={4}>
								<DecoStops entry={ this.state.currentEntry } />
								<Nitrox entry={ this.state.currentEntry } />
							</Col>
						</Row>
						<Row>
							<Col xs={12}>
								<h3>Dive Info</h3>
							</Col>
						</Row>
						<Row>
							<Col xs={12} md={4}>
								<Conditions entry={ this.state.currentEntry } />
							</Col>
							<Col xs={12} md={4}>
								<DiveType entry={ this.state.currentEntry } />
							</Col>
							<Col xs={12} md={4}>
								<Equipment entry={this.state.currentEntry } />
							</Col>
						</Row>
						<Row>
							<Col xs={12} md={4}>
								<Temperature entry={ this.state.currentEntry } />
							</Col>
							<Col xs={12} md={8}>
								<Notes
									controlId="notes"
									value={this.state.currentEntry.notes} />
							</Col>
						</Row>
					</Grid>
					<Button type="submit" bsStyle="primary" disabled={ this.state.isSaving }>
						{ this.state.isSaving ? 'Saving...' : 'Save Log Entry' }
					</Button>
					{ ' ' }
					<Button onClick={ this.showConfirmReset } disabled={ this.state.isSaving }>Discard changes</Button>
				</Formsy.Form>
				<ConfirmDialog
					confirmText="Discard"
					onConfirm={ this.confirmReset }
					onCancel={ this.hideConfirmReset }
					title="Confirm Reset"
					visible={ this.state.showConfirmReset }>
					<p>
						Are you sure you want to discard your changes? The log entry will be restored
						to its previously-saved state.
					</p>
				</ConfirmDialog>
			</div>);
	}
}

LogEntry.propTypes = {
	history: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired
};

export default withRouter(LogEntry);
