import React from 'react';
import { Image, Media } from 'react-bootstrap';

class ConnectOAuth extends React.Component {
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
						<a href="#">Connect Google Account</a>
					</Media.Body>
				</Media>
				<Media>
					<Media.Left align="middle">
						<Image src="/public/img/facebook_logo.png" rounded />
					</Media.Left>
					<Media.Body>
						<a href="#">Connect Facebook Account</a>
					</Media.Body>
				</Media>
				<Media>
					<Media.Left align="middle">
						<Image src="/public/img/github_logo.png" rounded />
					</Media.Left>
					<Media.Body>
						<a href="#">Connect GitHub Account</a>
					</Media.Body>
				</Media>
			</div>);
	}
}

export default ConnectOAuth;
