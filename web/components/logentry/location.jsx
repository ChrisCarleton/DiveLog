import CurrentEntryActions from '../../actions/current-entry-actions';
import HelpBubble from '../controls/help-bubble.jsx';
import PropTypes from 'prop-types';
import React from 'react';
import TextBox from '../controls/text-box.jsx';

import { Col, Row } from 'react-bootstrap';

class Location extends React.Component {
	constructor() {
		super();
		this.state = {};
		this.onLatitudeChange = this.onLatitudeChange.bind(this);
		this.onLongitudeChange = this.onLongitudeChange.bind(this);
		this.onDepthChange = this.onDepthChange.bind(this);
	}

	onLocationChange(e) {
		CurrentEntryActions.doPartialUpdate({ location: e.target.value });
	}

	onSiteChange(e) {
		CurrentEntryActions.doPartialUpdate({ site: e.target.value });
	}

	onLatitudeChange(e) {
		const gps = this.props.entry.gps || {};
		CurrentEntryActions.doPartialUpdate({
			gps: Object.assign({}, gps, { latitude: e.target.value })
		});
	}

	onLongitudeChange(e) {
		const gps = this.props.entry.gps || {};
		CurrentEntryActions.doPartialUpdate({
			gps: Object.assign({}, gps, { longitude: e.target.value })
		});
	}

	onDepthChange(e) {
		const depth = this.props.entry.depth
			? Object.assign({}, this.props.entry.depth)
			: {};

		switch (e.target.id) {
			case 'avgDepth':
				depth.average = e.target.value;
				break;

			case 'maxDepth':
				depth.max = e.target.value;
				break;
		}

		CurrentEntryActions.doPartialUpdate({ depth: depth });
	}

	render() {
		const gps = this.props.entry.gps || {};
		const depth = this.props.entry.depth || {};

		return (
			<div>
				<TextBox
					controlId="location"
					name="location"
					label="Location"
					placeholder="City or location of dive site"
					value={ this.props.entry.location }
					onChange={ this.onLocationChange }
					required />
				<TextBox
					controlId="site"
					name="site"
					label="Site"
					placeholder="Name of dive site"
					value={ this.props.entry.site }
					onChange={ this.onSiteChange }
					required />

				<Row>
					<Col xs={12}>
						<h4>
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
						</h4>
					</Col>
				</Row>

				<TextBox
					controlId="latitude"
					name="latitude"
					label="Latitude"
					value={ gps.latitude }
					onChange={ this.onLatitudeChange }
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
					onChange={ this.onLongitudeChange }
					validations={{
						isLongitude: true
					}}
					validationErrors={{
						isLongitude: 'Must be a valid GPS coordinate.'
					}} />

				<Row>
					<Col xs={12}>
						<h4>Depth</h4>
					</Col>
				</Row>
				<TextBox
					controlId="avgDepth"
					name="avgDepth"
					label="Average"
					value={ depth.average }
					onChange={ this.onDepthChange }
					validations={{
						isPositive: true
					}}
					validationErrors={{
						isPositive: 'Must be a positive value.'
					}} />
				<TextBox
					controlId="maxDepth"
					name="maxDepth"
					label="Max"
					value={ depth.max }
					onChange={ this.onDepthChange }
					validations={{
						isPositive: true
					}}
					validationErrors={{
						isPositive: 'Must be a positive value.'
					}} />
			</div>);
	}
}

Location.propTypes = {
	entry: PropTypes.object.isRequired
};

export default Location;
