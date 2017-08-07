import _ from 'lodash';
import DiveLogActions from '../actions/dive-log-actions';
import DiveLogStore from '../stores/dive-log-store';
import { IndexLinkContainer, LinkContainer } from 'react-router-bootstrap';
import moment from 'moment';
import React from 'react';
import PageHeader from './controls/page-header.jsx';
import PropTypes from 'prop-types';
import RequireAuth from './controls/require-auth.jsx';
import Spinner from './controls/spinner.jsx';

import {
	Alert,
	Breadcrumb,
	Button,
	ButtonGroup,
	ButtonToolbar,
	Col,
	Glyphicon,
	Grid,
	ListGroup,
	ListGroupItem,
	Media,
	Modal,
	Row
} from 'react-bootstrap';

class LogEntries extends React.Component {
	constructor() {
		super();
		this.state = {
			logs: [],
			isLoading: true,
			sortOrder: 'desc',
			deleting: null
		};
		this.onLogsRetrieved = this.onLogsRetrieved.bind(this);
		this.onLoadMoreClicked = this.onLoadMoreClicked.bind(this);
		this.onSortOrderChanged = this.onSortOrderChanged.bind(this);
		this.setDescSortOrder = this.setDescSortOrder.bind(this);
		this.setAscSortOder = this.setAscSortOder.bind(this);
		this.showDeleteDialog = this.showDeleteDialog.bind(this);
		this.onDeleteClicked = this.onDeleteClicked.bind(this);
		this.onCancelDeleteClicked = this.onCancelDeleteClicked.bind(this);
		this.deleteEntry = this.deleteEntry.bind(this);
	}

	componentDidMount() {
		DiveLogStore.listen(this.onLogsRetrieved);
		DiveLogActions.fetchLogEntries(
			this.props.match.params.userName,
			this.state.sortOrder);
	}

	componentWillUnmount() {
		DiveLogStore.unlisten(this.onLogsRetrieved);
	}

	onLogsRetrieved() {
		this.setState(DiveLogStore.getState());
	}

	onLoadMoreClicked() {
		DiveLogActions.fetchMoreLogEntries(
			this.props.match.params.userName,
			this.state.sortOrder,
			this.state.lastEntry);
	}

	setDescSortOrder() {
		this.onSortOrderChanged('desc');
	}

	setAscSortOder() {
		this.onSortOrderChanged('asc');
	}

	onSortOrderChanged(sortOrder) {
		if (this.state.sortOrder === sortOrder) return;
		DiveLogActions.setSortOrder(sortOrder);
		DiveLogActions.fetchLogEntries(
			this.props.match.params.userName,
			sortOrder);
	}

	formatDepth(depth) {
		if (!depth) {
			return 'unspecified';
		}

		return `${depth}'`;
	}

	onDeleteClicked(logEntry) {
		this.setState(
			Object.assign(
				{},
				this.state,
				{
					deleting: logEntry
				}));
	}

	onCancelDeleteClicked() {
		this.setState(
			Object.assign(
				{},
				this.state,
				{
					deleting: null
				}));
	}

	deleteEntry() {
		DiveLogActions.deleteEntry(
			this.props.match.params.userName,
			this.state.deleting.logId);
	}

	showDeleteDialog() {
		if (!this.state.deleting) {
			return null;
		}

		const entryTime = moment(this.state.deleting.entryTime).format('MMMM Do YYYY, h:mm a');
		return (
			<Modal.Dialog>
				<Modal.Header>
					<Modal.Title>Confirm Deletion</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>
						{ "Are you sure you want to delete the log book entry from " }
						<strong>{entryTime}</strong>
						{ "?" }
					</p>
					<p>
						<em>Caution: This cannot be undone.</em>
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={ this.deleteEntry } bsStyle="primary">Delete</Button>
					<Button onClick={ this.onCancelDeleteClicked }>Cancel</Button>
				</Modal.Footer>
			</Modal.Dialog>);
	}

	renderItem(item){
		const dateString = moment(item.entryTime).format('MMMM Do YYYY, h:mm a');
		return (
			<ListGroupItem key={ item.logId }>
				<Media.Left>
					<ButtonGroup>
						<Button onClick={ () => this.onDeleteClicked(item) }>
							<Glyphicon glyph="trash" />
						</Button>
					</ButtonGroup>
				</Media.Left>
				<Media.Body>
					<Media.Heading>
						<LinkContainer to={ `/logbook/${this.props.match.params.userName}/${item.logId}/` }>
							<a href="#">{ dateString }</a>
						</LinkContainer>
						{ item.diveNumber ? <small>(Dive #{ item.diveNumber })</small> : null }
					</Media.Heading>
					<Grid>
						<Row>
							<Col sm={12} md={3}>
								<dl>
									<dt>Location:</dt>
									<dd>{ item.location }</dd>

									<dt>Site:</dt>
									<dd>{ item.site }</dd>
								</dl>
							</Col>
							<Col xsHidden md={3}>
								<dl>
									<dt>Average Depth:</dt>
									<dd>{ this.formatDepth(item.depth.average) }</dd>

									<dt>Max Depth:</dt>
									<dd>{ this.formatDepth(item.depth.max) }</dd>
								</dl>
							</Col>
						</Row>
					</Grid>
				</Media.Body>
			</ListGroupItem>);
	}

	render() {
		const entries = _.map(this.state.logs, e => this.renderItem(e));

		return (
			<div>
				<RequireAuth />
				<Breadcrumb>
					<IndexLinkContainer to="/">
						<Breadcrumb.Item>Home</Breadcrumb.Item>
					</IndexLinkContainer>
					<Breadcrumb.Item active>Log Book</Breadcrumb.Item>
				</Breadcrumb>

				<PageHeader heading="Log Book" alertKey="log-book" />
				<p>Showing <strong>{ this.state.logs.length }</strong> log entries.</p>
				<ButtonToolbar>
					<ButtonGroup>
						<LinkContainer to={ `/logbook/${this.props.match.params.userName}/new` }>
							<Button bsStyle="primary">Create New Entry</Button>
						</LinkContainer>
					</ButtonGroup>
					<ButtonGroup>
						<Button active={ this.state.sortOrder !== 'asc' } onClick={ this.setDescSortOrder }>
							Latest to Earliest
						</Button>
						<Button active={ this.state.sortOrder === 'asc' } onClick={ this.setAscSortOder }>
							Earliest to Latest
						</Button>
					</ButtonGroup>
				</ButtonToolbar>
				<ListGroup>
					{ entries }
				</ListGroup>
				{ this.state.isLoading
					? <Spinner message="Loading..." />
					: this.state.endOfStream
						? <Alert bsStyle="info"><Glyphicon glyph="exclamation-sign" /> No more items to show.</Alert>
						: <Button onClick={ this.onLoadMoreClicked }>Load More</Button> }
				{ this.showDeleteDialog() }
			</div>);
	}
}

LogEntries.propTypes = {
	match: PropTypes.object.isRequired
};

export default LogEntries;
