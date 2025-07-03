const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const shortid = require('shortid');

//* Middleware
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//* Temporary local storage
let users = [];
let exercises = [];

//* Routes

app.get('/api/users/delete', (_req, res) => {
	console.log('### DELETE ALL USERS ###');
	users = [];
	res.json({ message: 'All users have been deleted!', result: users });
});

app.get('/api/exercises/delete', (_req, res) => {
	console.log('### DELETE ALL EXERCISES ###');
	exercises = [];
	res.json({ message: 'All exercises have been deleted!', result: exercises });
});

app.get('/', (_req, res) => {
	res.sendFile(__dirname + '/views/index.html');
});

/*
 * GET all users
 */
app.get('/api/users', (_req, res) => {
	console.log('### GET ALL USERS ###');
	if (users.length === 0) {
		return res.json({ message: 'There are no users in the database!' });
	}
	res.json(users);
});

/*
 * POST create user
 */
app.post('/api/users', (req, res) => {
	const inputUsername = req.body.username;
	const newUser = {
		_id: shortid.generate(),
		username: inputUsername,
	};

	users.push(newUser);
	console.log(`Created new user: ${inputUsername}`);
	res.json(newUser);
});

/*
 * POST add exercise
 */
app.post('/api/users/:_id/exercises', (req, res) => {
	const userId = req.params._id;
	const { description, duration } = req.body;
	let { date } = req.body;

	const user = users.find((u) => u._id === userId);
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}

	if (!date) {
		date = new Date().toISOString().substring(0, 10);
	}

	const newExercise = {
		userId,
		username: user.username,
		description,
		duration: parseInt(duration),
		date,
	};

	exercises.push(newExercise);

	res.json({
		username: user.username,
		description: newExercise.description,
		duration: newExercise.duration,
		date: new Date(newExercise.date).toDateString(),
		_id: userId,
	});
});

/*
 * GET user logs
 */
app.get('/api/users/:_id/logs', (req, res) => {
	const userId = req.params._id;
	const from = req.query.from || new Date(0).toISOString().substring(0, 10);
	const to = req.query.to || new Date().toISOString().substring(0, 10);
	const limit = Number(req.query.limit) || 0;

	const user = users.find((u) => u._id === userId);
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}

	let userExercises = exercises.filter((e) => {
		return (
			e.userId === userId &&
			e.date >= from &&
			e.date <= to
		);
	});

	if (limit > 0) userExercises = userExercises.slice(0, limit);

	const log = userExercises.map((e) => ({
		description: e.description,
		duration: e.duration,
		date: new Date(e.date).toDateString(),
	}));

	res.json({
		_id: userId,
		username: user.username,
		count: log.length,
		log,
	});
});

//* Server start
const listener = app.listen(3000, () => {
	console.log('Your app is listening on port ' + listener.address().port);
});
