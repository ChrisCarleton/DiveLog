import HelpBubble from '../controls/help-bubble.jsx';
import PropTypes from 'prop-types';
import React from 'react';
import TextBox from '../controls/text-box.jsx';

import { Row } from 'react-bootstrap';

class Location extends React.Component {
	constructor() {
		super();
		this.state = {};
	}

	render() {
		const gps = this.props.entry.gps || {};

		return (
			<div>
				<TextBox
					controlId="location"
					name="location"
					label="Location"
					placeholder="City or location of dive site"
					value={ this.props.entry.location }
					required />
				<TextBox
					controlId="site"
					name="site"
					label="Site"
					placeholder="Name of dive site"
					value={ this.props.entry.site }
					required />

				<Row>
					<h5>
						GPS Coordinates{' '}
						<HelpBubble id="gps-help">
							<span>
								{"Specify GPS coordinates in either decimal "}
								<em>
									{"(e.g. -19.3097)"}
								</em>
								{" or sexagesimal "}
								<em>
									{"(e.g. 51° 29' 46.000\" N)"}
								</em>
								{" format."}
							</span>
						</HelpBubble>
					</h5>
				</Row>

				<TextBox
					controlId="latitude"
					name="latitude"
					label="Latitude"
					value={ gps.latitude }
					validations={{
						isLatitude: true
					}}
					validationErrors={{
						isLatitude: 'Must be a valid GPS coordinate.'
					}} />
				<TextBox
					controlId="longitude"
					name="longitude"
					label="Longitude"
					value={ gps.longitude }
					validations={{
						isLongitude: true
					}}
					validationErrors={{
						isLongitude: 'Must be a valid GPS coordinate.'
					}} />
			</div>);
	}
}

Location.propTypes = {
	entry: PropTypes.object.isRequired
};

export default Location;
