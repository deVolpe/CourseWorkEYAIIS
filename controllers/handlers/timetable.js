import cheerio from 'cheerio';
import axios from '../../axios_config.js';

const getAllTransportNumbers = async (params = { city: 'brest', type: 'autobus' }) => {
	try {
		const res = await axios(`${params.city}/${params.type}`),
			$ = cheerio.load(res.data),
			html = $('a.btn.btn-primary.bold.route'),
			numbers = [];
		for (let i = 0; i < html.length; i++) {
			const href = html[i].attribs.href;
			numbers.push(href.slice(href.lastIndexOf('/') + 1));
		}
		return { ...params, numbers };
	} catch (e) {
		throw new Error(e);
	}
};

const getAllTransportRouteStations = async (params = { city: 'brest', type: 'autobus', number: '1' }) => {
	const url = `${params.city}/${params.type}/${params.number}/`;
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
		number: '1',
		station: 'Газоаппарат%20-%20Бернады/Университет',
	}
) => {
	const url = `${params.city}/${params.type}/${params.number}/${params.station}`;
	try {
		const res = await axios(url),
			$ = cheerio.load(res.data);

		const html = $('div.timetable>span'),
			prev = html[0] ? html[0].children[0].data.trim() : '',
			next = html[1] ? html[1].children[0].data.trim() : '',
			after = html[2] ? html[2].children[0].data.trim() : '',
			[route, station] = decodeURIComponent(params.station).split('/');
		return {
			...params,
			next,
			prev,
			after,
			station,
			route,
			number: decodeURIComponent(params.number),
		};
	} catch (e) {
		throw new Error(e);
	}
};

export { getAllTransportNumbers, getAllTransportRouteStations, getTransportClosestDateTimeArriving };
