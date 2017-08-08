import AlertActions from './alert-actions';
import alt from '../alt';
import request from '../request-agent';

class CurrentEntryActions {
	fetchLogEntry(userName, id) {
		return dispatch => {
			dispatch();
			AlertActions.dismissAlert('log-entry');
			request
				.get(`/api/logs/${userName}/${id}`)
				.then(res => {
					this.fetchLogSucceeded(res.body);
				})
				.catch(err => {
					if (err.status === 404) {
						return this.fetchErrored('not found');
					}
					if (err.status === 500) {
						return this.fetchErrored('server error');
					}

					AlertActions.handleErrorResponse('log-entry', err);
				});
		};
	}

	fetchLogSucceeded(logInfo) {
		return logInfo;
	}

	fetchErrored(reason) {
		return reason;
	}

	createEntry(userName, logInfo, history) {
		return dispatch => {
			dispatch();
			AlertActions.dismissAlert('log-entry');
			request
				.post(`/api/logs/${userName}/`)
				.send(logInfo)
				.then(res => {
					history.push(`/logbook/${userName}/${res.body.logId}/`);
					AlertActions.showSuccess(
						'log-entry',
						'Entry Created',
						'Your new log entry has been saved successfully.');
				})
				.catch(error => {
					this.endSaving();
					AlertActions.handleErrorResponse('log-entry', error);
				});
		};
	}

	saveEntry(userName, logId, logInfo) {
		this.beginSaving();
		AlertActions.dismissAlert('log-entry');
		return dispatch => {
			dispatch();
			request
				.put(`/api/logs/${userName}/${logId}/`)
				.send(logInfo)
				.then(res => {
					this.saveSucceeded(res.body);
					AlertActions.showSuccess(
						'log-entry',
						'Entry Saved',
						'The changes to your log entry have been saved successfully.');
				})
				.catch(err => {
					this.endSaving();
					AlertActions.handleErrorResponse('log-entry', err);
				});
		};
	}

	saveSucceeded(result) {
		this.endSaving();
		return result;
	}

	beginSaving() {
		return true;
	}

	endSaving() {
		return false;
	}

	doPartialUpdate(update) {
		return update;
	}

	updateCylinderInfo(index, cylinder) {
		return {
			index: index,
			cylinder: cylinder
		};
	}

	clearEntry() {
		return {};
	}
}

export default alt.createActions(CurrentEntryActions);
