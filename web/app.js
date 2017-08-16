import alt from './alt';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Chrome from './components/chrome.jsx';
import Home from './components/home.jsx';
import LogEntries from './components/log-entries.jsx';
import LogEntry from './components/log-entry.jsx';
import LogIn from './components/login.jsx';
import NotFound from './components/errors/not-found.jsx';
import Profile from './components/profile.jsx';
import React from 'react';
import { render } from 'react-dom';
import ServerError from './components/errors/server-error.jsx';
import SignUp from './components/sign-up.jsx';

require('./validations');
require('./styles/divelog.less');

class AppRouter extends React.Component {
	render() {
		return (
			<Router>
				<Chrome>
					<Switch>
						<Route exact path="/" component={ Home } />
						<Route exact path="/login" component={ LogIn } />
						<Route exact path="/signup" component={ SignUp } />
						<Route exact path="/logbook/:userName" component={ LogEntries } />
						<Route exact path="/logbook/:userName/new" component={ LogEntry } />
						<Route exact path="/logbook/:userName/:logId" component={ LogEntry } />
						<Route path="/profile/:userName" component={ Profile } />
						<Route exact path="/error/notFound" component={ NotFound } />
						<Route exact path="/error/server" component={ ServerError } />
						<Route component={ NotFound } />
					</Switch>
				</Chrome>
			</Router>);
	}
}

alt.bootstrap(JSON.stringify(window.initialState));
render(<AppRouter />, document.getElementById('app'));
