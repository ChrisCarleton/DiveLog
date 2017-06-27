import { BrowserRouter as Router } from 'react-router-dom';
import Home from './components/home.jsx';
import React from 'react';
import { render } from 'react-dom';

class AppRouter extends React.Component {
	render() {
		return (
			<Router>
				<Home />
			</Router>);
	}
}

render(<AppRouter />, document.getElementById('app'));
