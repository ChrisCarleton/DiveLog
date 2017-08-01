import _ from 'lodash';
import Formsy from 'formsy-react';
import geolib from 'geolib';

const isPositive = value => {
	if (!value) return true;
	const number = _.toNumber(value);
	if (Number.isNaN(number)) return false;
	return number > 0.0;
};

Formsy.addValidationRule('isAtLeast', (values, value, minimum) => {
	return value >= minimum;
});

Formsy.addValidationRule('isPositive', (values, value) => {
	return isPositive(value);
});

Formsy.addValidationRule('isInteger', (values, value) => {
	if (!value) return true;
	const int = _.toNumber(value);
	if (Number.isNaN(int)) return false;

	return _.isInteger(int);
});

Formsy.addValidationRule('isBetween', (values, value, bounds) => {
	if (!value) return true;

	const number = Number.parseFloat(value);
	if (Number.isNaN(number)) return false;

	return (number >= bounds.min && number <= bounds.max);
});

function isGps(value, bounds) {
	if (!value) return true;

	let decimalValue;
	try {
		decimalValue = geolib.useDecimal(value);
	} catch (error) {
		return false;
	}

	return (bounds[0] <= decimalValue && decimalValue <= bounds[1]);
}

Formsy.addValidationRule('isDecoStop', (values, value) => {
	if (!value) return true;

	if (value.depth && !isPositive(value.depth)) return false;
	if (value.duration && !isPositive(value.duration)) return false;

	return true;
});

Formsy.addValidationRule('isLatitude', (values, value) => {
	return isGps(value, [-90.0, 90.0]);
});

Formsy.addValidationRule('isLongitude', (values, value) => {
	return isGps(value, [-180.0, 180.0]);
});
