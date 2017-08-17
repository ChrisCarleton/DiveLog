import _ from 'lodash';
import OAuthActions from '../../actions/oauth-actions';
import OAuthStore from '../../stores/oauth-store';
import PropTypes from 'prop-types';
import React from 'react';
import { Image, Media } from 'react-bootstrap';

class ConnectOAuth extends React.Component {
	constructor() {
		super();
		this.state = {
			connectedAccounts: null
		};
		this.onAccountsChanged = this.onAccountsChanged.bind(this);
	}

	componentDidMount() {
		OAuthStore.listen(this.onAccountsChanged);
		OAuthActions.fetchOAuthAccounts(this.props.match.params.userName);
	}

	componentWillUnmount() {
		OAuthStore.unlisten(this.onAccountsChanged);
	}

	onAccountsChanged() {
		this.setState(OAuthStore.getState());
	}

	getAccountState(provider, friendlyName) {
		if (!this.state.connectedAccounts) {
			return <span>Please wait...</span>;
		}

		if (_.indexOf(this.state.connectedAccounts, provider) === -1) {
			return <a href={ `/auth/${provider}/connect` }>{ `Connect your ${friendlyName} account` }</a>;
		}

		return (
			<span>
				<strong>{ `Your ${friendlyName} account is connected!` }</strong>
				{ ' ' }
				<a href="#">(disconnect?)</a>
			</span>);
	}

	render() {
		return (
			<div>
				<h3>Connect OAuth Providers</h3>
				<p>
					By connecting OAuth providers to your account you can use your existing social
					media accounts to gain access to your dive logs!
				</p>
				<Media>
					<Media.Left align="middle">
						<Image src="/public/img/google_logo.png" rounded />
					</Media.Left>
					<Media.Body>
						{ this.getAccountState('google', 'Google') }
					</Media.Body>
				</Media>
				<Media>
					<Media.Left align="middle">
						<Image src="/public/img/facebook_logo.png" rounded />
					</Media.Left>
					<Media.Body>
						{ this.getAccountState('facebook', 'Facebook') }
					</Media.Body>
				</Media>
				<Media>
					<Media.Left align="middle">
						<Image src="/public/img/github_logo.png" rounded />
					</Media.Left>
					<Media.Body>
						{ this.getAccountState('github', 'GitHub') }
					</Media.Body>
				</Media>
			</div>);
	}
}

ConnectOAuth.propTypes = {
	match: PropTypes.object.isRequired
};

export default ConnectOAuth;
