import _ from 'lodash';
import Formsy from 'formsy-react';
import geolib from 'geolib';

const isPositive = value => {
	if (!value) return true;
	const number = _.toNumber(value);
	if (Number.isNaN(number)) return false;
	return number > 0.0;
};

Formsy.addValidationRule('isPositive', (values, value) => {
	return isPositive(value);
});

Formsy.addValidationRule('isInteger', (values, value) => {
	if (!value) return true;
	const int = _.toNumber(value);
	if (Number.isNaN(int)) return false;

	return _.isInteger(int);
});

Formsy.addValidationRule('min', (values, value, minimum) => {
	if (!value) return true;
	const number = _.toNumber(value);
	if (Number.isNaN(number)) return true;
	return number >= minimum;
});

Formsy.addValidationRule('max', (values, value, maximum) => {
	if (!value) return true;
	const number = _.toNumber(value);
	if (Number.isNaN(number)) return true;
	return number <= maximum;
});

Formsy.addValidationRule('noMoreThan', (values, value, id) => {
	if (!value || !values[id]) return true;
	const number = _.toNumber(value);
	const other = _.toNumber(values[id]);
	if (Number.isNaN(number) || Number.isNaN(other)) return true;
	return number <= other;
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
