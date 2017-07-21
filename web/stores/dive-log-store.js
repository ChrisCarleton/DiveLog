import _ from 'lodash';
import alt from '../alt';
import DiveLogActions from '../actions/dive-log-actions';

class DiveLogStore {
	constructor() {
		this.isLoading = true;
		this.logs = [];

		this.bindListeners({
			loading: DiveLogActions.START_LOADING,
			fetchLogs: DiveLogActions.FETCH_ENTRIES_SUCCEEDED,
			fetchMoreLogs: DiveLogActions.FETCH_MORE_ENTRIES_SUCCEEDED
		});

		this.loading = this.loading.bind(this);
		this.fetchLogs = this.fetchLogs.bind(this);
		this.fetchMoreLogs = this.fetchMoreLogs.bind(this);
	}

	loading() {
		this.isLoading = true;
	}

	fetchLogs(logs) {
		this.isLoading = false;
		this.logs = logs;
	}

	fetchMoreLogs(newLogs) {
		this.isLoading = false;
		this.logs = _.concat(this.logs, newLogs);
	}
}

export default alt.createStore(DiveLogStore, 'DiveLogStore');
