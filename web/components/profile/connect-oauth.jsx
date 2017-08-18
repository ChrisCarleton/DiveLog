import _ from 'lodash';
import OAuthActions from '../../actions/oauth-actions';
import OAuthStore from '../../stores/oauth-store';
import PropTypes from 'prop-types';
import React from 'react';
import { Glyphicon, Image, Media } from 'react-bootstrap';
import UserStore from '../../stores/user-store';

class ConnectOAuth extends React.Component {
	constructor() {
		super();
		this.state = {
			connectedAccounts: null,
			currentUser: null
		};
		this.onAccountsChanged = this.onAccountsChanged.bind(this);
		this.onUserChanged = this.onUserChanged.bind(this);
	}

	componentDidMount() {
		OAuthStore.listen(this.onAccountsChanged);
		UserStore.listen(this.onUserChanged);
		OAuthActions.fetchOAuthAccounts(this.props.match.params.userName);
		this.onUserChanged();
	}

	componentWillUnmount() {
		OAuthStore.unlisten(this.onAccountsChanged);
		UserStore.unlisten(this.onUserChanged);
	}

	onAccountsChanged() {
		this.setState(
			Object.assign(
				{},
				this.state,
				OAuthStore.getState()));
	}

	onUserChanged() {
		this.setState(
			Object.assign(
				{},
				this.state,
				{ currentUser: UserStore.getState().currentUser }));
	}

	disconnectProvider(provider) {
		OAuthActions.removeOAuthAccount(
			this.props.match.params.userName,
			provider);
	}

	getDisconnectLink(provider) {
		if (!this.state.connectedAccounts || !this.state.currentUser) {
			return null;
		}

		if (this.state.connectedAccounts.length > 1 || this.state.currentUser.hasPassword) {
			return (
				<span>
					{ '(' }
					<a href="#" onClick={ () => this.disconnectProvider(provider) }>
						disconnect?
					</a>
					{ ')' }
				</span>);
		}

		return null;
	}

	getAccountState(provider, friendlyName) {
		if (!this.state.connectedAccounts) {
			return <span>Please wait...</span>;
		}

		if (_.indexOf(this.state.connectedAccounts, provider) === -1) {
			return <a href={ `/auth/${provider}/connect` }>{ `Connect your ${friendlyName} account` }</a>;
		}

		return (
			<div>
				<Glyphicon className="text-success" glyph="ok" />
				<span>
					{ ' ' }
					<strong>{ `Your ${friendlyName} account is connected!` }</strong>
					{ ' ' }
					{ this.getDisconnectLink(provider) }
				</span>
			</div>);
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
