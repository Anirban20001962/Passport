const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const giveToken = async (err, user, next, req, res) => {
	try {
		if (err || !user) {
			const error = new Error('An error occurred.');
			return next(error);
		}

		req.login(user, { session: false }, async (error) => {
			if (error) return next(error);
			const body = { _id: user._id, email: user.email };
			const token = jwt.sign({ user: body }, process.env.JWT_SECRET, {
				expiresIn: '30m',
			});
			return res.json({ token });
		});
	} catch (error) {
		return next(error);
	}
};

router.post('/signup', async (req, res, next) => {
	passport.authenticate(
		'signup',
		{ session: false },
		async (err, user, info) => {
			if (err) {
				res.json({
					message: 'A error is occured',
				});
			}
			res.json({
				message: 'Signup successful',
				user: user,
			});
		}
	)(req, res, next);
});

router.post('/login', async (req, res, next) => {
	passport.authenticate('login', async (err, user, info) => {
		giveToken(err, user, next, req, res);
	})(req, res, next);
});

router.get(
	'/google',
	passport.authenticate('google', { scope: ['email'], session: false })
);

router.get('/google/callback', async (req, res, next) => {
	passport.authenticate(
		'google',
		{
			session: false,
		},
		async (err, user, info) => {
			giveToken(err, user, next, req, res);
		}
	)(req, res, next);
});

module.exports = router;
