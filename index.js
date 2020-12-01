import axios from 'axios';
import cheerio from 'cheerio';

const getAllVehiclePaths = () => {
	axios(baseUrl)
		.then((res) => {
			const $ = cheerio.load(res.data);
			const html = $('a.btn.btn-primary.bold.route');
			const promises = [];

			for (let i = 0; i < html.length; i++) {
				promises.push(axios(html[i].attribs.href).then((res) => res.data));
			}

			Promise.all(promises)
				.then((response) => console.log(response.length))
				.catch(console.error);
		})
		.catch(console.error);
};

// const getAllStations = (data) => {
// 	const $ = cheerio.load(data[0]);

// 	const html = $('ul.list-group>li.list-group-item>a');
// 	const promises = [];

// 	for (let i = 0; i < 3; i++) {
// 		promises.push(
// 			axios(html[i].attribs.href).then((res) => console.log(res.data))
// 		);
// 	}

// 	Promise.all(promises)
// 		.then((res) => getClosestTimeArriving(res))
// 		.catch(() => console.log(12));
// };

// const getStationInfo = (data) => {};

// const getClosestTimeArriving = (data) => {
// 	for (const _html of data) {
// 		const $ = cheerio.load(_html);

// 		const html = $('div.timetable>span');
// 		for (let i = 0; i < html.length; i++) {
// 			console.log(decodeURIComponent(_resp.url));
// 			console.log(html[i].children[0].data.trim());
// 		}
// 	}
// };

getAllVehiclePaths();
