import { spawn } from 'child_process';
import errorHandler from '../utils/errorHandler.js';
import { validateQueryString } from './validators/query.js';

const getTimetable = (req, res) => {
	const { errors, isValid } = validateQueryString({ ...req.query, ...req.body });

	if (!isValid) {
		return res.status(400).json(errors);
	}

	try {
		const execFilePath = 'handlers/job';
		const args = [];
		args.push(req.query?.city || req.body?.city);
		args.push(req.query?.type || req.body?.type);
		args.push(req.query?.path || req.body?.path);
		args.push(req.query?.station || req.body?.station);
		const spawnProcess = spawn('node', [execFilePath, ...args]);
		res.json({ status: 'Uploaded', id: spawnProcess.pid });
	} catch (e) {
		errorHandler(res, e);
	}
};

const downloadTimetable = (req, res) => {
	const id = req.query?.id || req.body?.id;
	if (!id) return res.status(400).json({ status: 'Error', message: 'Id must be not null, undefined or empty string' });
	try {
		res.download(`./${id}.csv`);
	} catch (e) {
		errorHandler(res, e);
	}
};

const getJobStatus = (req, res) => {
	const id = req.query?.id || req.body?.id;
	if (!id) return res.status(400).json({ status: 'Error', message: 'Id must be not null, undefined or empty string' });
	try {
		process.kill(id, 0);
		res.json({ status: 'In Progress' });
	} catch (e) {
		res.json({ status: 'Completed' });
	}
};

export { getTimetable, downloadTimetable, getJobStatus };
