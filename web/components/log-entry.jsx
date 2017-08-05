import Air from './logentry/air.jsx';
import Conditions from './logentry/conditions.jsx';
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
import PageHeader from './controls/page-header.jsx';
import PropTypes from 'prop-types';
import React from 'react';
import RequireAuth from './controls/require-auth.jsx';
import SiteMap from './logentry/site-map.jsx';
import Weight from './logentry/weight.jsx';

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
			currentEntry: {}
		};

		this.onStateChanged = this.onStateChanged.bind(this);
		this.submit = this.submit.bind(this);
		this.reset = this.reset.bind(this);
	}

	componentDidMount() {
		CurrentEntryStore.listen(this.onStateChanged);

		const params = this.props.match.params;
		if (params.logId) {
			CurrentEntryActions.fetchLogEntry(
				params.userName,
				params.logId);
		}
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

	reset() {

	}

	submit() {
		if (this.props.match.params.logId) {
			CurrentEntryActions.saveEntry(
				this.props.match.params.userName,
				this.props.match.params.logId,
				this.state.currentEntry);
		} else {
			CurrentEntryActions.createEntry(
				this.props.match.params.userName,
				this.state.currentEntry);
		}
	}

	render() {
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
				<Formsy.Form className="form-horizontal" onValidSubmit={ this.submit }>
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
									entry={ this.state.currentEntry } />
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
						<Notes
							controlId="notes"
							value={this.state.currentEntry.notes} />
					</Grid>
					<Button type="submit" bsStyle="primary" disabled={ this.state.isSaving }>
						{ this.state.isSaving ? "Saving..." : "Save Log Entry" }
					</Button>
					{ " " }
					<Button onClick={ this.reset } disabled={ this.state.isSaving }>Reset</Button>
				</Formsy.Form>
				<p>{ JSON.stringify(this.state.currentEntry, null, ' ') }</p>
			</div>);
	}
}

LogEntry.propTypes = {
	match: PropTypes.object.isRequired
};

export default LogEntry;
