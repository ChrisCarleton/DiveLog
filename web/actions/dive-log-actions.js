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

	fetchLogEntries(userName, sortOrder = 'desc') {
		return dispatch => {
			dispatch();
			this.startLoading();

			request
				.get(`/api/logs/${userName}/`)
				.query({ order: sortOrder })
				.then(res => {
					this.fetchEntriesSucceeded(res.body);
				})
				.catch(err => {
					console.error(err);
					this.cancelLoading();
					AlertActions.handleErrorResponse('log-book', err);
				});
		};
	}

	fetchMoreLogEntries(userName, sortOrder = 'desc', startingAt) {
		return dispatch => {
			dispatch();
			this.startLoading();

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
					console.error(err);
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
}

export default alt.createActions(DiveLogActions);
