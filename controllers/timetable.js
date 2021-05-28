import { spawn } from 'child_process';
import errorHandler from '../utils/errorHandler.js';
import { validateQueryString } from './validators/query.js';

const CACHE = new Map();

const createTimetableJob = (req, res) => {
	const { errors, isValid } = validateQueryString({ ...req.query, ...req.body });

	if (!isValid) {
		return res.status(400).json(errors);
	}
	const date = new Date().toISOString();
	try {
		const execFilePath = 'controllers/handlers/job';
		const args = [];
		args.push(req.query?.city || req.body?.city);
		args.push(req.query?.type || req.body?.type);
		args.push(req.query?.path || req.body?.path || '');
		args.push(req.query?.station || req.body?.station || '');
		args.push(date);

		const spawnProcess = spawn('node', [execFilePath, ...args]);
		spawnProcess.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});

		spawnProcess.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
		});

		spawnProcess.on('close', (code) => {
			console.log(`Code ${code}`);
		});
		CACHE.set(spawnProcess.pid, date);
		console.log(CACHE);
		res.json({ status: 'Uploaded', id: spawnProcess.pid });
	} catch (e) {
		errorHandler(res, e);
	}
};

const downloadTimetable = (req, res) => {
	const id = req.query?.id || req.body?.id;
	if (!id) return res.status(400).json({ status: 'Error', message: 'Id must not be null, undefined or empty string' });
	try {
		console.log(CACHE);
		if (!CACHE.has(id)) return res.status(404).json({ status: 'Error', message: 'No file found by process id' });
		res.download(`data/${CACHE.get(id)}.csv`);
	} catch (e) {
		errorHandler(res, e);
	}
};

const getJobStatus = (req, res) => {
	const id = req.query?.id || req.body?.id;
	if (!id) return res.status(400).json({ status: 'Error', message: 'Id must not be null, undefined or empty string' });
	try {
		process.kill(id, 0);
		res.json({ status: 'In Progress' });
	} catch (e) {
		res.json({ status: 'Completed' });
	}
};

export { createTimetableJob, downloadTimetable, getJobStatus };
