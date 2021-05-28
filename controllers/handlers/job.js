import fs from 'fs';
import { AsyncParser } from 'json2csv';
import {
	getAllTransportPaths,
	getAllTransportPathStations,
	getTransportClosestDateTimeArriving,
} from './handlers/timetable.js';

const fields = ['city', 'type', 'path', 'station', 'prev', 'next', 'after'];
const opts = { fields };
const transformOpts = { highWaterMark: 8192 };

class Job {
	constructor() {
		this.city = process.argv[2];
		this.type = process.argv[3];
		this.path = process.argv[4];
		this.station = process.argv[5];
		this.date = process.argv[6];
	}

	run = async () => {
		const paths = [],
			_stations = [];

		const allTransportParams = { city: this.city, type: this.type };

		try {
			if (!this.path) {
				const result = await getAllTransportPaths(allTransportParams);
				paths.push(...result.paths.map((p) => encodeURIComponent(p)));
			} else paths.push(encodeURIComponent(this.path));

			if (!this.station) {
				const result = await Promise.all(
					paths.map((path) => getAllTransportPathStations({ ...allTransportParams, path }))
				);
				result.forEach(({ city, path, type, stations }) => {
					_stations.push(...stations.map((station) => ({ city, type, path, station })));
				});
			} else _stations.push({ ...allTransportParams, path: this.path, station: this.station });

			const asyncParser = new AsyncParser(opts, transformOpts);

			asyncParser.processor.pipe(
				fs.createWriteStream(`./${this.date}.csv`, {
					encoding: 'utf-8',
				})
			);

			for (const station of _stations) {
				const data = await getTransportClosestDateTimeArriving(station);
				asyncParser.input.push(JSON.stringify(data));
			}
		} catch (error) {
			throw { message: error.message || error };
		}
	};
}
console.log(process.argv);
new Job()
	.run()
	.then(() => {
		process.exit(0);
	})
	.catch((err) => {
		process.exit(1);
	});
