import AlertActions from './alert-actions';
import alt from '../alt';
import request from '../request-agent';

class DiveLogActions {
	startLoading() {
		return true;
	}

	cancelLoading() {
		return false;
	}

	setSortOrder(order) {
		return order;
	}

	deleteEntry(userName, logId) {
		return dispatch => {
			dispatch();
			AlertActions.dismissAlert('log-book');

			request
				.delete(`/api/logs/${userName}/${logId}/`)
				.then(() => {
					this.deleteSucceeded(logId);
				})
				.catch(err => {
					AlertActions.handleErrorResponse('log-book', err);
				});
		};
	}

	fetchLogEntries(userName, sortOrder = 'desc') {
		return dispatch => {
			dispatch();
			this.startLoading();
			AlertActions.dismissAlert('log-book');

			request
				.get(`/api/logs/${userName}/`)
				.query({ order: sortOrder })
				.then(res => {
					this.fetchEntriesSucceeded(res.body);
				})
				.catch(err => {
					this.cancelLoading();
					AlertActions.handleErrorResponse('log-book', err);
				});
		};
	}

	fetchMoreLogEntries(userName, sortOrder = 'desc', startingAt) {
		return dispatch => {
			dispatch();
			this.startLoading();
			AlertActions.dismissAlert('log-book');

			const options = { order: sortOrder };
			if (sortOrder === 'asc') {
				options.after = startingAt;
			} else {
				options.before = startingAt;
			}

			request
				.get(`/api/logs/${userName}/`)
				.query(options)
				.then(res => {
					this.fetchMoreEntriesSucceeded(res.body);
				})
				.catch(err => {
					this.cancelLoading();
					AlertActions.handleErrorResponse('log-book', err);
				});
		};
	}

	fetchEntriesSucceeded(entries) {
		return entries;
	}

	fetchMoreEntriesSucceeded(entries) {
		return entries;
	}

	deleteSucceeded(logId) {
		AlertActions.showSuccess('log-book', 'Entry deleted', 'The selected entry has been removed from your log book.');
		return logId;
	}

	clearEntries() {
		return [];
	}
}

export default alt.createActions(DiveLogActions);
