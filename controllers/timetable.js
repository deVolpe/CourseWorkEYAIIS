import errorHandler from '../utils/errorHandler.js';
import {
	getAllTransportPaths,
	getAllTransportPathStations,
} from './handlers/timetable.js';
import { validateQueryString } from './validators/query.js';

const getTimetable = async (req, res) => {
	const { errors, isValid } = validateQueryString(req.query);

	if (!isValid) {
		res.status(400).json(errors).end();
	}

	try {
		const { city, type, path, station } = req.query,
			_paths = [],
			_stations = [];

		if (!path) {
			_paths.push(...(await getAllTransportPaths({ city, type })));
		}

		if (!station) {
			_stations = await Promise.all(
				_paths.map((path) => getAllTransportPathStations({ city, type, path }))
			);
		}

		if (_paths.length) {
		}

		res.json().end();
	} catch (e) {
		errorHandler(res, e);
	}
};

export { getTimetable };
