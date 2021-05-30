import { spawn } from 'child_process';
import errorHandler from '../utils/errorHandler.js';
import { validateRequest } from './validators/request.js';

const CACHE = new Map();

const createTimetableJob = (req, res) => {
	const { errors, isValid } = validateRequest(req.body);

	if (!isValid) {
		return res.status(400).json(errors);
	}
	const date = new Date().toISOString();
	try {
		const execFilePath = 'controllers/handlers/job';
		const args = [];
		args.push(req.body.city);
		args.push(req.body.type);
		args.push(req.body.path || '');
		args.push(req.body.station || '');
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
		res.json({ status: 'Uploaded', id: spawnProcess.pid });
	} catch (e) {
		errorHandler(res, e);
	}
};

const downloadTimetable = (req, res) => {
	const id = req.body.id;
	if (!id) return res.status(400).json({ status: 'Error', message: 'Id must not be null, undefined or empty string' });
	try {
		if (!CACHE.has(+id)) return res.status(404).json({ status: 'Error', message: 'No file found by process id' });
		res.download(`${CACHE.get(+id)}.csv`);
	} catch (e) {
		errorHandler(res, e);
	}
};

const getJobStatus = (req, res) => {
	const id = req.query.id;
	if (!id) return res.status(400).json({ status: 'Error', message: 'Id must not be null, undefined or empty string' });
	try {
		process.kill(id, 0);
		res.json({ status: 'In Progress' });
	} catch (e) {
		res.json({ status: 'Completed' });
	}
};

export { createTimetableJob, downloadTimetable, getJobStatus };
