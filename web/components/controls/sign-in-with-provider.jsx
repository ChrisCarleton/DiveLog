import React from 'react';

import { Button, Image, Media } from 'react-bootstrap';

class SignInWithProvider extends React.Component {
	render() {
		return (
			<div>
				<h4>Sign In Using One of These Providers</h4>
				<Media>
					<Media.Left align="middle">
						<Image src="/public/img/google_logo.png" rounded />
					</Media.Left>
					<Media.Body>
						<a href="/auth/google"><Button>Sign In with Google</Button></a>
					</Media.Body>
				</Media>
				<Media>
					<Media.Left align="middle">
						<Image src="/public/img/facebook_logo.png" rounded />
					</Media.Left>
					<Media.Body>
						<a href="/auth/facebook"><Button>Sign In with Facebook</Button></a>
					</Media.Body>
				</Media>
				<Media>
					<Media.Left align="middle">
						<Image src="/public/img/twitter_logo.png" rounded />
					</Media.Left>
					<Media.Body>
						<a href="/auth/twitter"><Button>Sign In with Twitter</Button></a>
					</Media.Body>
				</Media>
				<Media>
					<Media.Left align="middle">
						<Image src="/public/img/github_logo.png" rounded />
					</Media.Left>
					<Media.Body>
						<a href="/auth/github"><Button>Sign In with GitHub</Button></a>
					</Media.Body>
				</Media>
			</div>);
	}
}

export default SignInWithProvider;
