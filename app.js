import express from 'express';
import cors from 'cors';
import timetableRoutes from './routes/timetable.js';

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get('/', (req, res) => {
	res.redirect('/api/routes/timetable');
});

app.use('/api/routes', timetableRoutes);

app.listen(port, () => console.log(`Server has been started ${port}`));
