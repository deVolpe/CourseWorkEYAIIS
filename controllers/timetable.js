import { AsyncParser } from 'json2csv';
import fs from 'fs';
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
			_result.forEach(({ city, path, type, stations }) => {
				_stations.push(
					...stations.map((station) => ({ city, type, path, station }))
				);
			});
		} else _stations.push({ city, type, path: _path, station: _station });

		const iter = _stations[Symbol.iterator]();

		const asyncParser = new AsyncParser(opts, transformOpts);
		asyncParser.processor.pipe(
			fs.createWriteStream(`./${new Date(id).toISOString()}.csv`)
		);

		processBatch(iter, asyncParser);
		// const data = await Promise.all(
		// 	_stations.map((s) => getTransportClosestDateTimeArriving(s))
		// );

		// for (const _data of data) {
		// 	asyncParser.input.push(JSON.stringify(_data));
		// }
		return res.json({ status: 'Uploaded', id });
	} catch (e) {
		errorHandler(res, e);
	}
};

const processBatch = (iter, parser) => {
	const batch = iter.next();

	getTransportClosestDateTimeArriving(batch.value)
		.then((data) => {
			parser.input.push(JSON.stringify(data));

			if (!batch.done) processBatch(iter, parser);
		})
		.catch(console.error);
};

const downloadTimetable = (req, res) => {
	const { id } = req.query;
	res.download(`./${new Date(+id).toISOString()}.csv`);
};

const getJobStatus = (req, res) => {
	const { id } = req.query;
	fs.readFile(`./${new Date(+id).toISOString()}.csv`, (err, data) => {
		if (err) {
			return res.json({ status: 'In Processing', id });
		}

		res.json({ status: 'Completed', id });
	});
};

export { getTimetable, downloadTimetable, getJobStatus };
