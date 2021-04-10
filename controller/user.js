const User = require('../models/User');
const passport = require('passport');

exports.signup = (req,res,next) => {
    User.register({username: req.body.username},req.body.password)
    .then((user) => {
        passport.authenticate('local')(req,res,() => {
            activeUsers.set(user.username,user);
            res.redirect('/');
        })
    })
    .catch((err) => {
        console.log(err);
        res.redirect('/signup');
    })
}

exports.login = (req,res,next,activeUsers) => {
    passport.authenticate('local',{failureRedirect: '/login'})(req,res,(e) => {
        activeUsers.set(req.user.username,req.user);
        res.redirect('/');
    })
}