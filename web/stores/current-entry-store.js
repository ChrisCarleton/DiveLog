import alt from '../alt';
import CurrentEntryActions from '../actions/current-entry-actions';

class CurrentEntryStore {
	constructor() {
		this.currentEntry = {};
		this.isSaving = false;

		this.bindListeners({
			entryRetrieved: [
				CurrentEntryActions.FETCH_LOG_SUCCEEDED,
				CurrentEntryActions.FETCH_ERRORED,
				CurrentEntryActions.CLEAR_ENTRY ],
			onPartialUpdate: CurrentEntryActions.DO_PARTIAL_UPDATE,
			onUpdateCylinder: CurrentEntryActions.UPDATE_CYLINDER_INFO,
			onSavingChanged: [
				CurrentEntryActions.BEGIN_SAVING,
				CurrentEntryActions.END_SAVING]
		});

		this.entryRetrieved = this.entryRetrieved.bind(this);
		this.onSavingChanged = this.onSavingChanged.bind(this);
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

	onSavingChanged(isSaving) {
		this.isSaving = isSaving;
	}
}

export default alt.createStore(CurrentEntryStore, 'CurrentEntryStore');
