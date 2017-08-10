import geolib from 'geolib';
import { GoogleMap, Marker, withGoogleMap } from 'react-google-maps';
import PropTypes from 'prop-types';
import React from 'react';

class SiteMap extends React.Component {
	render() {
		// Paso de Cedral, Cozumel!
		const defaultPosition = {lat: 20.354289, lng: -87.028272};

		const gps = this.props.gps || {};
		let position, marker = null;

		try {
			if (gps.latitude && gps.longitude) {
				position = {
					lat: geolib.useDecimal(gps.latitude),
					lng: geolib.useDecimal(gps.longitude)
				};
				marker =
					<Marker
						position={position}
						key="dive site"
						title={this.props.site || 'dive site'}
						defaultAnimation={2} />;
			}
		} catch(error) {
			position = {};
		}

		if (!marker) {
			position = defaultPosition;
		}

		return (
			<GoogleMap
				ref={this.props.onMapLoad}
				defaultCenter={defaultPosition}
				center={position}
				defaultZoom={12}
				onClick={this.props.onMapClick}>

				{marker}

			</GoogleMap>);
	}
}

SiteMap.propTypes = {
	gps: PropTypes.object,
	onMapClick: PropTypes.func,
	onMapLoad: PropTypes.func,
	site: PropTypes.string
};

export default withGoogleMap(SiteMap);
