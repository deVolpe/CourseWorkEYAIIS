import express from 'express';
import * as controller from '../controllers/timetable.js';

const router = express.Router();

router.get('/timetable', controller.getTimetable);
router.get('/timetable/status', controller.getJobStatus);
router.get('/timetable/download', controller.downloadTimetable);
export default router;
