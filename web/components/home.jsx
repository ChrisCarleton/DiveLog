import { Link } from 'react-router-dom';
import React from 'react';

import {
	Button,
	Jumbotron
} from 'react-bootstrap';

class Home extends React.Component {
	render() {
		return (
			<div>
				<Jumbotron>
					<h1>Bottom Time<br/>
						<small>An online log book for scuba divers</small>
					</h1>
					<Button bsStyle="primary" bsSize="large">Log In Now</Button>&nbsp;
					Don't have an account? <Link to="/signup">Sign up!</Link>
				</Jumbotron>

				<p>
					An online logbook for scuba divers.
				</p>
			</div>);
	}
}

export default Home;
