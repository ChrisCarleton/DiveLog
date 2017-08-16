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
}

export default alt.createActions(OAuthActions);
