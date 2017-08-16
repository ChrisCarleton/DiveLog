import alt from '../alt';
import OAuthActions from '../actions/oauth-actions';

class OAuthStore {
	constructor() {
		this.connectedAccounts = null;
		this.bindListeners({
			fetchAccounts: OAuthActions.FETCH_OAUTH_ACCOUNTS_SUCCEEDED
		});

		this.fetchAccounts = this.fetchAccounts.bind(this);
	}

	fetchAccounts(accounts) {
		this.connectedAccounts = accounts;
	}
}

export default alt.createStore(OAuthStore, 'OAuthStore');
