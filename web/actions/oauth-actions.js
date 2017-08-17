import AlertActions from './alert-actions';
import alt from '../alt';
import request from '../request-agent';

class OAuthActions {
	fetchOAuthAccounts(userName) {
		return dispatch => {
			dispatch();
			request
				.get(`/api/auth/${userName}/oauth`)
				.then(res => {
					this.fetchOAuthAccountsSucceeded(res.body);
				})
				.catch(err => {
					AlertActions.handleErrorResponse('profile', err);
				});
		};
	}

	fetchOAuthAccountsSucceeded(accounts) {
		return accounts;
	}

	removeOAuthAccount(userName, provider) {
		return dispatch => {
			dispatch();
			request
				.delete(`/api/auth/${userName}/oauth/${provider}`)
				.then(() => this.removeOAuthAccountSucceeded(provider))
				.catch(err => {
					AlertActions.handleErrorResponse('profile', err);
				});
		};
	}

	removeOAuthAccountSucceeded(provider) {
		return provider;
	}
}

export default alt.createActions(OAuthActions);
