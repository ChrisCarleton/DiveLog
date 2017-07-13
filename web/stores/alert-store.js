import AlertActions from '../actions/alert-actions';
import alt from '../alt';

class AlertStore {
	constructor() {
		this.alertVisible = false;
		this.alertStyle = 'danger';
		this.title = null;
		this.description = null;

		this.bindListeners({
			onShow: [
				AlertActions.SHOW_INFO,
				AlertActions.SHOW_SUCCESS,
				AlertActions.SHOW_ERROR,
				AlertActions.SHOW_WARNING,
				AlertActions.HANDLE_ERROR_RESPONSE
			],
			onDismiss: AlertActions.DISMISS_ALERT
		});
	}

	onShow(alertState) {
		this.alertVisible = true;
		this.alertStyle = alertState.alertStyle;
		this.title = alertState.title;
		this.description = alertState.description;
	}

	onDismiss() {
		this.alertVisible = false;
	}
}

export default alt.createStore(AlertStore, 'AlertStore');
