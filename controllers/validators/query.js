import _ from 'lodash';

const validateQueryString = (data) => {
	const errors = [];

	if (_.isEmpty(data.city)) {
		const error = {};
		error.type = 'missed_value';
		error.param = 'city';
		error.message = 'City param is empty or not valid';
		errors.push(error);
	}

	if (_.isEmpty(data.type)) {
		const error = {};
		error.type = 'missed_value';
		error.param = 'type';
		error.message = 'Type param is empty or not valid';
		errors.push(error);
	}

	if (_.isEmpty(data.path) && !_.isEmpty(data.station)) {
		const error = {};
		error.type = 'missed_value';
		error.param = 'path';
		error.message = 'The path must be specified';
		errors.push(error);
	}
	return { errors, isValid: _.isEmpty(errors) };
};

export { validateQueryString };
