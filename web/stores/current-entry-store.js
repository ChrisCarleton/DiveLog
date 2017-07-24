import alt from '../alt';
import CurrentEntryActions from '../actions/current-entry-actions';

class CurrentEntryStore {
	constructor() {
		this.currentEntry = {};

		this.bindListeners({
			entryRetrieved: CurrentEntryActions.FETCH_LOG_SUCCEEDED,
			onPartialUpdate: CurrentEntryActions.DO_PARTIAL_UPDATE
		});

		this.entryRetrieved = this.entryRetrieved.bind(this);
	}

	entryRetrieved(entryInfo) {
		this.currentEntry = entryInfo;
	}

	onPartialUpdate(update) {
		Object.assign(this.currentEntry, update);
	}
}

export default alt.createStore(CurrentEntryStore, 'CurrentEntryStore');
