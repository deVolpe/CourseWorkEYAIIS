import { AsyncParser } from 'json2csv';
import fs from 'fs';
import path from 'path';
import errorHandler from '../utils/errorHandler.js';
import {
	getAllTransportPaths,
	getAllTransportPathStations,
	getTransportClosestDateTimeArriving,
} from './handlers/timetable.js';
import { validateQueryString } from './validators/query.js';

const fields = ['city', 'type', 'path', 'station', 'prev', 'next', 'after'];
const opts = { fields };
const transformOpts = { highWaterMark: 8192 };

const getTimetable = async (req, res) => {
	const { errors, isValid } = validateQueryString(req.query);

	if (!isValid) {
		res.status(400).json(errors).end();
	}
	const id = new Date().getTime();
	try {
		const { city, type, path, station } = req.query,
			_paths = [],
			_stations = [],
			_path = encodeURIComponent(path),
			_station = encodeURIComponent(station);

		if (!path) {
			const _result = await getAllTransportPaths({ city, type });
			_paths.push(..._result.paths);
		} else _paths.push(_path);

		if (!station) {
			const _result = await Promise.all(
				_paths.map((path) => getAllTransportPathStations({ city, type, path }))
			);
			_stations.push(..._result);
		} else _stations.push({ city, type, path: _path, station: _station });

		Promise.all(_stations.map((s) => getTransportClosestDateTimeArriving(s)))
			.then((data) => {
				const asyncParser = AsyncParser(opts, transformOpts);
				asyncParser.processor.pipe(
					fs.createWriteStream(path.resolve(__dirname, id + '.csv'))
				);
				for (const _data of data) {
					asyncParser.input.push(_data);
				}
			})
			.catch((err) => errorHandler(res, err));
		res.json({ status: 'Queued', id: new Date().getTime() });
	} catch (e) {
		errorHandler(res, e);
	}
};

export { getTimetable };
