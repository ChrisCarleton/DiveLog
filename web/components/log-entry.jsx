import CurrentEntryActions from '../actions/current-entry-actions';
import CurrentEntryStore from '../stores/current-entry-store';
import Formsy from 'formsy-react';
import { IndexLinkContainer } from 'react-router-bootstrap';
import DiveLocation from './logentry/location.jsx';
import DiveTime from './logentry/dive-time.jsx';
import PageHeader from './controls/page-header.jsx';
import PropTypes from 'prop-types';
import React from 'react';
import SiteMap from './logentry/site-map.jsx';

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
			currentEntry: {}
		};

		this.onStateChanged = this.onStateChanged.bind(this);
		this.submit = this.submit.bind(this);
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

	submit(model) {}

	render() {
		return (
			<div>
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
										<div style={{ height: '360px' }} />
									}
									mapElement={
										<div style={{ height: '100%' }} />
									} />
							</Col>
						</Row>
						<Row>
							<Col xs={12}>
								<h3>Air and Weight</h3>
							</Col>
						</Row>
					</Grid>
					<Button type="submit" bsStyle="primary">Save</Button>
				</Formsy.Form>
				<p>{ JSON.stringify(this.state.currentEntry, null, ' ') }</p>
			</div>);
	}
}

LogEntry.propTypes = {
	match: PropTypes.object.isRequired
};

export default LogEntry;
