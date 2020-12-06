import express from 'express';
import * as controller from '../controllers/timetable.js';

const router = express.Router();

router.get('/timetable', controller.getTimetable);

export default router;
