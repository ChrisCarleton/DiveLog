import _ from 'lodash';
import DiveLogActions from '../actions/dive-log-actions';
import DiveLogStore from '../stores/dive-log-store';
import moment from 'moment';
import React from 'react';
import PageHeader from './controls/page-header.jsx';
import PropTypes from 'prop-types';
import Spinner from './controls/spinner.jsx';

import {
	Alert,
	Button,
	Col,
	Glyphicon,
	Grid,
	ListGroup,
	ListGroupItem,
	Row
} from 'react-bootstrap';

class LogEntries extends React.Component {
	constructor() {
		super();
		this.state = {
			logs: [],
			isLoading: true
		};
		this.onLogsRetrieved = this.onLogsRetrieved.bind(this);
		this.onLoadMoreClicked = this.onLoadMoreClicked.bind(this);
	}

	componentDidMount() {
		DiveLogStore.listen(this.onLogsRetrieved);
		DiveLogActions.fetchLogEntries(this.props.match.params.userName);
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
			'desc',
			this.state.lastEntry);
	}

	formatDepth(depth) {
		if (!depth) {
			return 'unspecified';
		}

		return `${depth}'`;
	}

	renderItem(item){
		const dateString = moment(new Date(item.entryTime)).format('MMMM Do YYYY, h:mm a');
		return (
			<ListGroupItem
				key={ item.entryTime }
				href={ `/logbook/${this.props.match.params.userName}/${item.logId}/` }
				disabled>
				<h3>{ dateString } { item.diveNumber ? <small>(Dive #{ item.diveNumber })</small> : null }</h3>
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

			</ListGroupItem>);
	}

	render() {
		const entries = _.map(this.state.logs, e => this.renderItem(e));

		return (
			<div>
				<PageHeader heading="Log Book" alertKey="log-book" />
				<p>Showing <strong>{ this.state.logs.length }</strong> log entries.</p>
				<ListGroup>
					{ entries }
				</ListGroup>
				{ this.state.isLoading 
					? <Spinner message="Loading..." />
					: this.state.endOfStream
						? <Alert bsStyle="info"><Glyphicon glyph="exclamation-sign" /> No more items to show.</Alert>
						: <Button onClick={ this.onLoadMoreClicked }>Load More</Button> }
			</div>);
	}
}

LogEntries.propTypes = {
	match: PropTypes.object.isRequired
};

export default LogEntries;
