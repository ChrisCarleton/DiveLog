import AlertActions from './alert-actions';
import alt from '../alt';
import request from '../request-agent';

class CurrentEntryActions {
	fetchLogEntry(userName, id) {
		return dispatch => {
			dispatch();
			request
				.get(`/api/logs/${userName}/${id}`)
				.then(res => {
					AlertActions.dismissAlert('log-entry');
					this.fetchLogSucceeded(res.body);
				})
				.catch(err => {
					AlertActions.handleErrorResponse('log-entry', err);
				});
		};
	}

	fetchLogSucceeded(logInfo) {
		return logInfo;
	}

	createEntry(userName, logInfo) {
		return dispatch => {
			dispatch();
			request
				.post(`/api/logs/${userName}/`)
				.send(logInfo)
				.then(res => {
					AlertActions.dismissAlert('log-entry');
					this.saveSucceeded(res.body);
				})
				.catch(error => {
					this.endSaving();
					AlertActions.handleErrorResponse('log-entry', error);
				});
		};
	}

	saveEntry(userName, logId, logInfo) {
		this.beginSaving();
		return dispatch => {
			dispatch();
			request
				.put(`/api/logs/${userName}/${logId}/`)
				.send(logInfo)
				.then(res => {
					AlertActions.dismissAlert('log-entry');
					this.saveSucceeded(res.body);
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
}

export default alt.createActions(CurrentEntryActions);
