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

	doPartialUpdate(update) {
		return update;
	}
}

export default alt.createActions(CurrentEntryActions);
