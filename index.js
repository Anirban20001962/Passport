require('dotenv').config();
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const app = express();
const database_URI = process.env.DATABASE_URI;
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

app.use(express.json());
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET,HEAD,OPTIONS,POST,PUT,DELETE'
	);
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type,  Authorization'
	);
	next();
});

require('./passportConfig');

app.use('/auth', authRoutes);
app.use('/', passport.authenticate('jwt', { session: false }), userRoutes);

mongoose
	.connect(database_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(() => {
		app.listen(3000, () => {
			console.log('Server is running');
		});
	})
	.catch((err) => {
		console.log(err);
	});
