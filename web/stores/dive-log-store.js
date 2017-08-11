import _ from 'lodash';
import alt from '../alt';
import DiveLogActions from '../actions/dive-log-actions';

class DiveLogStore {
	constructor() {
		this.isLoading = true;
		this.logs = [];
		this.endOfStream = false;
		this.lastEntry = null;
		this.deleting = null;
		this.sortOrder = 'desc';

		this.bindListeners({
			loading: DiveLogActions.START_LOADING,
			stopLoading: DiveLogActions.CANCEL_LOADING,
			setSortOrder: DiveLogActions.SET_SORT_ORDER,
			fetchLogs: [ DiveLogActions.FETCH_ENTRIES_SUCCEEDED, DiveLogActions.CLEAR_ENTRIES ],
			fetchMoreLogs: DiveLogActions.FETCH_MORE_ENTRIES_SUCCEEDED,
			entryDeleted: DiveLogActions.DELETE_SUCCEEDED
		});

		this.loading = this.loading.bind(this);
		this.fetchLogs = this.fetchLogs.bind(this);
		this.fetchMoreLogs = this.fetchMoreLogs.bind(this);
		this.entryDeleted = this.entryDeleted.bind(this);
	}

	loading() {
		this.isLoading = true;
	}

	stopLoading() {
		this.isLoading = false;
	}

	setSortOrder(order) {
		this.sortOrder = order;
		this.isLoading = true;
		this.logs = [];
		this.lastEntry = null;
		this.endOfStream = false;
	}

	fetchLogs(logs) {
		this.isLoading = false;
		this.logs = logs;
		this.lastEntry = logs.length > 1 ? logs[logs.length - 1].entryTime : null;
		this.endOfStream = (logs.length < 100);
	}

	fetchMoreLogs(newLogs) {
		this.isLoading = false;
		this.logs = _.concat(this.logs, newLogs);
		this.lastEntry = newLogs.length > 1 ? newLogs[newLogs.length - 1].entryTime : null;
		this.endOfStream = (newLogs.length < 100);
	}

	entryDeleted(entryId) {
		_.remove(this.logs, e => e.logId === entryId);
	}
}

export default alt.createStore(DiveLogStore, 'DiveLogStore');
