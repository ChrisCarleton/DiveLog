import { GoogleMap, Marker, withGoogleMap } from 'react-google-maps';
import React from 'react';

class SiteMap extends React.Component {
	render() {
		const position = {lat: 20.354289, lng: -87.028272};

		return (
			<GoogleMap
				ref={this.props.onMapLoad}
				defaultCenter={position}
				defaultZoom={12}
				onClick={this.props.onMapClick}>

				<Marker position={position} key="Paso de Cedral" defaultAnimation={2} />

			</GoogleMap>);
	}
}

export default withGoogleMap(SiteMap);
