import fs from 'fs';
import { AsyncParser } from 'json2csv';
import {
	getAllTransportNumbers,
	getAllTransportRouteStations,
	getTransportClosestDateTimeArriving,
} from './timetable.js';

const fields = ['city', 'type', 'route', 'number', 'station', 'prev', 'next', 'after'];
const opts = { fields };
const transformOpts = { highWaterMark: 8192 };

class Job {
	constructor() {
		this.city = process.argv[2];
		this.type = process.argv[3];
		this.number = process.argv[4];
		this.station = process.argv[5];
		this.date = process.argv[6];
	}

	run = async () => {
		const numbers = [],
			_stations = [];

		const allTransportParams = { city: this.city, type: this.type };

		try {
			if (!this.number) {
				const result = await getAllTransportNumbers(allTransportParams);
				numbers.push(...result.numbers);
			} else numbers.push(encodeURIComponent(this.number));

			if (!this.station) {
				const result = await Promise.all(
					numbers.map((number) => getAllTransportRouteStations({ ...allTransportParams, number }))
				);
				result.forEach(({ city, number, type, stations }) => {
					_stations.push(...stations.map((station) => ({ city, type, number, station })));
				});
			} else _stations.push({ ...allTransportParams, number: this.number, station: this.station });

			const asyncParser = new AsyncParser(opts, transformOpts);

			asyncParser.processor.pipe(
				fs.createWriteStream(`${this.date}.csv`, {
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

new Job().run().then(() => {
	process.exit(0);
});
