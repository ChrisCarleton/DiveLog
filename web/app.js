import { BrowserRouter as Router, Route } from 'react-router-dom';
import Chrome from './components/chrome.jsx';
import Home from './components/home.jsx';
import React from 'react';
import { render } from 'react-dom';

class AppRouter extends React.Component {
	render() {
		return (
			<Router>
				<Chrome>
					<Route path="/" component={ Home } />
				</Chrome>
			</Router>);
	}
}

render(<AppRouter />, document.getElementById('app'));
