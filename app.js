import express from 'express';

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors'));

app.get('/api/routes', (req, res) => {
	console.log(req.query);
	console.log(req.path);
	console.log(req.body);
	res.json({}).end();
});

app.listen(port, () => console.log(`Server has been started ${port}`));
