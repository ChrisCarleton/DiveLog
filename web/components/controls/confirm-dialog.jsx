import PropTypes from 'prop-types';
import React from 'react';

import { Button, Modal } from 'react-bootstrap';

class ConfirmDialog extends React.Component {

	render() {
		if (!this.props.visible) {
			return null;
		}

		return (
			<Modal.Dialog>
				<Modal.Header>
					<Modal.Title>{ this.props.title || 'Confirm' }</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{ this.props.children }
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={ this.props.onConfirm } bsStyle="primary">
						{ this.props.confirmText || 'Confirm' }
					</Button>
					<Button onClick={ this.props.onCancel }>
						{ this.props.cancelText || 'Cancel' }
					</Button>
				</Modal.Footer>
			</Modal.Dialog>);
	}
}

ConfirmDialog.propTypes = {
	cancelText: PropTypes.string,
	children: PropTypes.node.isRequired,
	confirmText: PropTypes.string,
	onConfirm: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
	title: PropTypes.string,
	visible: PropTypes.bool
};

export default ConfirmDialog;
