import _ from 'lodash';

const tryReturnAsNumber = value => {
	if (_.isNil(value) || value === '') return null;

	const number = _.toNumber(value);
	if (Number.isNaN(number)) {
		return value;
	}

	return number;
};

export default {
	tryReturnAsNumber: tryReturnAsNumber
};
