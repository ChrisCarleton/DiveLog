import PropTypes from 'prop-types';
import React from 'react';

import {
	Glyphicon,
	OverlayTrigger,
	Tooltip
} from 'react-bootstrap';

class HelpBubble extends React.Component {
	render() {
		const tooltip = <Tooltip id={this.props.id}>{ this.props.children }</Tooltip>

		return (
			<OverlayTrigger placement="right" overlay={tooltip}>
				<Glyphicon glyph="question-sign" />
			</OverlayTrigger>);
	}
}

HelpBubble.propTypes = {
	id: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired
};

export default HelpBubble;
