import AlertActions from '../actions/alert-actions';
import alt from '../alt';

class AlertStore {
	constructor() {
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

		this.onShow = this.onShow.bind(this);
		this.onDismiss = this.onDismiss.bind(this);
	}

	onShow(alertState) {
		this[alertState.key] = {
			alertVisible: true,
			alertStyle: alertState.alertStyle,
			alertTitle: alertState.title,
			alertDescription: alertState.description
		};
	}

	onDismiss(alertKey) {
		this[alertKey] = {
			alertVisible: false
		};
	}
}

AlertStore.alerts = {};

export default alt.createStore(AlertStore, 'AlertStore');
