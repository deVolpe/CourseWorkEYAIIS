import axios from 'axios';

export default axios.create({
	baseURL: 'https://kogda.by/routes/',
	timeout: 120000,
});
