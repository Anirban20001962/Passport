const passport = require('passport');
const User = require('./models/User');
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const bcrypt = require('bcrypt');
require('dotenv').config();

passport.use(
	'signup',
	new localStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async (email, password, done) => {
			try {
				const modifiedPassword = await bcrypt.hash(password, 10);
				const user = await User.create({
					email,
					password: modifiedPassword,
				});
				return done(null, user);
			} catch (error) {
				done(error);
			}
		}
	)
);

passport.use(
	'login',
	new localStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async (email, password, done) => {
			try {
				const user = await User.findOne({ email });

				if (!user) {
					return done(null, false, { message: 'User not found' });
				}

				const validate = await user.validPassword(
					password,
					user.password
				);

				if (!validate) {
					return done(null, false, { message: 'Wrong Password' });
				}

				return done(null, user, { message: 'Logged in Successfully' });
			} catch (error) {
				return done(error);
			}
		}
	)
);

passport.use(
	new JWTstrategy(
		{
			secretOrKey: process.env.JWT_SECRET,
			jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token'),
		},
		async (token, done) => {
			try {
				return done(null, token.user);
			} catch (error) {
				done(error);
			}
		}
	)
);

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: '/auth/google/callback',
		},
		function (accessToken, refreshToken, profile, done) {
			let email = profile.emails[0].value;
			User.findOne({ email: email })
				.then((user) => {
					if (!user) {
						const user = new User({
							email: email,
						});
						return user.save();
					}
					return user;
				})
				.then((user) => {
					return done(null, user);
				})
				.catch((err) => {
					console.log(err);
					return done(err, null);
				});
		}
	)
);
