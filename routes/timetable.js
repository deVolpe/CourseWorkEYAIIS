import express from 'express';
import * as controller from '../controllers/timetable.js';

const router = express.Router();

router.post('/timetable', controller.createTimetableJob);
router.get('/timetable/status', controller.getJobStatus);
router.post('/timetable/download', controller.downloadTimetable);
export default router;
