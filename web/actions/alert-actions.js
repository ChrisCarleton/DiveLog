import alt from '../alt';

class AlertActions {
	showInfo(alertKey, title, description) {
		return {
			key: alertKey,
			alertStyle: 'info',
			title: title,
			description: description
		};
	}

	showSuccess(alertKey, title, description) {
		return {
			key: alertKey,
			alertStyle: 'success',
			title: title,
			description: description
		};
	}

	showWarning(alertKey, title, description) {
		return {
			key: alertKey,
			alertStyle: 'warning',
			title: title,
			description: description
		};
	}

	showError(alertKey, title, description) {
		return {
			key: alertKey,
			alertStyle: 'danger',
			title: title,
			description: description
		};
	}

	handleErrorResponse(alertKey, res) {
		const state = {
			key: alertKey,
			alertStyle: 'danger'
		};

		if (!res.body || !res.body.error) {
			// Unrecognized response.
			state.title = 'Could not get a valid response from server';
			state.description = 'Please try again later.';
		} else if (res.body.errorId === 1000) {
			// General validation failure. Don't render the details.
			state.title = 'There was a problem with the information you submitted.';
			state.description = 'Re-check the information you entered and follow any suggestions given.';
		} else {
			state.title = res.body.error;
			state.description = res.body.details;
		}

		return state;
	}

	dismissAlert(alertKey) {
		return alertKey;
	}
}

export default alt.createActions(AlertActions);
