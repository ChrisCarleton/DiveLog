import _ from 'lodash';
import alt from '../alt';
import OAuthActions from '../actions/oauth-actions';

class OAuthStore {
	constructor() {
		this.connectedAccounts = [];
		this.bindListeners({
			fetchAccounts: OAuthActions.FETCH_OAUTH_ACCOUNTS_SUCCEEDED,
			removeAccount: OAuthActions.REMOVE_OAUTH_ACCOUNT_SUCCEEDED
		});

		this.fetchAccounts = this.fetchAccounts.bind(this);
		this.removeAccount = this.removeAccount.bind(this);
	}

	fetchAccounts(accounts) {
		this.connectedAccounts = accounts;
	}

	removeAccount(provider) {
		_.pull(this.connectedAccounts, provider);
	}
}

export default alt.createStore(OAuthStore, 'OAuthStore');
