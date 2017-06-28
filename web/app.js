import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Chrome from './components/chrome.jsx';
import Home from './components/home.jsx';
import LogIn from './components/login.jsx';
import NotFound from './components/errors/not-found.jsx'
import React from 'react';
import { render } from 'react-dom';
import SignUp from './components/sign-up.jsx';

class AppRouter extends React.Component {
	render() {
		return (
			<Router>
				<Chrome>
					<Switch>
						<Route exact path="/" component={ Home } />
						<Route exact path="/login" component={ LogIn } />
						<Route exact path="/signup" component={ SignUp } />
						<Route component={ NotFound } />
					</Switch>
				</Chrome>
			</Router>);
	}
}

render(<AppRouter />, document.getElementById('app'));
