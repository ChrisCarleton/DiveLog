import alt from '../alt';
import CurrentEntryActions from '../actions/current-entry-actions';

class CurrentEntryStore {
	constructor() {
		this.currentEntry = {};

		this.bindListeners({
			entryRetrieved: CurrentEntryActions.FETCH_LOG_SUCCEEDED,
			onPartialUpdate: CurrentEntryActions.DO_PARTIAL_UPDATE,
			onUpdateCylinder: CurrentEntryActions.UPDATE_CYLINDER_INFO
		});

		this.entryRetrieved = this.entryRetrieved.bind(this);
	}

	entryRetrieved(entryInfo) {
		this.currentEntry = entryInfo;
	}

	onPartialUpdate(update) {
		Object.assign(this.currentEntry, update);
	}

	onUpdateCylinder(info) {
		if (!this.currentEntry.cylinders) this.currentEntry.cylinders = [];
		this.currentEntry.cylinders[info.index] = info.cylinder;
	}
}

export default alt.createStore(CurrentEntryStore, 'CurrentEntryStore');
