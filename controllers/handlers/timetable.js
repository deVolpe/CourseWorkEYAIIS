import cheerio from 'cheerio';
import axios from '../../axios_config.js';

const getAllTransportPaths = async (
	params = { city: 'brest', type: 'autobus' }
) => {
	try {
		const res = await axios(`${params.city}/${params.type}`),
			$ = cheerio.load(res.data),
			html = $('a.btn.btn-primary.bold.route'),
			paths = [];
		for (let i = 0; i < html.length; i++) {
			const href = html[i].attribs.href;
			paths.push(href.slice(href.lastIndexOf('/') + 1));
		}
		return { ...params, paths };
	} catch (e) {
		throw new Error(e);
	}
};

const getAllTransportPathStations = async (
	params = { city: 'brest', type: 'autobus', path: '1' }
) => {
	const url = `${params.city}/${params.type}/${params.path}/`;
	try {
		const res = await axios(url),
			$ = cheerio.load(res.data),
			html = $('ul.list-group>li.list-group-item>a'),
			stations = [];
		for (let i = 0; i < html.length; i++) {
			const href = html[i].attribs.href;
			stations.push(href.replace(axios.defaults.baseURL + url, ''));
		}
		return { ...params, stations };
	} catch (e) {
		throw new Error(e);
	}
};

const getTransportClosestDateTimeArriving = async (
	params = {
		city: 'brest',
		type: 'autobus',
		path: '1',
		station: 'Газоаппарат%20-%20Бернады/Университет',
	}
) => {
	const url = `${params.city}/${params.type}/${params.path}/${params.station}`;
	try {
		const res = await axios(url),
			$ = cheerio.load(res.data);
		console.log($('div.timetable>span')[0]);
		const html = $('div.timetable>span'),
			prev = html[0].children[0].data.trim(),
			next = html[1].children[0].data.trim(),
			after = html[2].children[0].data.trim();

		return {
			...params,
			next,
			prev,
			after,
			station: decodeURIComponent(params.station),
			path: decodeURIComponent(params.path),
		};
	} catch (e) {
		throw new Error(e);
	}
};

export {
	getAllTransportPaths,
	getAllTransportPathStations,
	getTransportClosestDateTimeArriving,
};
