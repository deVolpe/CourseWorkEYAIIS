const CITIES = ['minsk', 'brest', 'grodno', 'gomel', 'vitebsk', 'mogilev'];

const validateRequest = (data) => {
	const errors = [];

	if (!data.city) {
		errors.push({ type: 'missed_value', param: 'city', message: 'City param is empty or not valid' });
	}

	if (!CITIES.includes(data.city)) {
		errors.push({ type: 'unsupported_value', param: 'city', message: "City is not supported or doesn't exist" });
	}

	if (!data.type) {
		errors.push({ type: 'missed_value', param: 'type', message: 'Type param is empty or not valid' });
	}

	if (!data.path && data.station) {
		errors.push({ type: 'missed_value', param: 'path', message: 'The path must be specified' });
	}
	return { errors, isValid: !Object.keys(errors).length };
};

export { validateRequest };
