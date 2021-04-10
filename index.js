const express = require('express')
const path = require('path')
require('dotenv').config()
const passport = require('passport')
const mongoose = require('mongoose')
const session = require('express-session')
const app = express()
const database_URI = process.env.DATABASE_URI
const User = require('./models/User')
const {signup,login} = require('./controller/user')
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}
const checkSameUser = (req,res,next) => {
    if(activeUsers.has(req.body.username) || req.isAuthenticated()) {
        console.log("Already logged in somewhere");
        return res.redirect('/login');
    }
    next();
}

let activeUsers = new Map()

app.use(express.urlencoded({extended: false}))
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
       User.findOne({googleId: profile.id})
       .then((user) => {
           if(!user) {
               const user = new User({username: profile.emails[0].value,googleId: profile.id})
               return user.save()
           }
           return user
       })
       .then((user) => {
           return done(null,user);
       })
       .catch((err) => {
           console.log(err);
           return done(err,null);
       })
  }
));

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/',isAuthenticated,(req,res,next) => {
    res.sendFile('home.html', { root: path.join(__dirname, '/public') });
})

app.get('/signup',(req,res,next) => {
    res.sendFile('signup.html', { root: path.join(__dirname, '/public') });
})

app.get('/login',(req,res,next) => {
    res.sendFile('login.html', { root: path.join(__dirname, '/public') });
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

app.post('/signup',(req,res,next) => {
    signup(req,res,next,activeUsers);
});

app.post('/login',checkSameUser,(req,res,next) => {
    login(req,res,next,activeUsers);
})

app.get('/logout',(req,res,next) => {
    req.logout();
    res.redirect('/login');
})

mongoose.connect(database_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}) 
.then(() => {
    app.listen(3000,() => {
        console.log("Server is running")
    })
})
.catch((err) => {
    console.log(err)
})


// userModel.findByUsername(email).then(function(sanitizedUser){
//     if (sanitizedUser){
//         sanitizedUser.setPassword(newPasswordString, function(){
//             sanitizedUser.save();
//             res.status(200).json({message: 'password reset successful'});
//         });
//     } else {
//         res.status(500).json({message: 'This user does not exist'});
//     }
// },function(err){
//     console.error(err);
// })

// user.setPassword(req.body.password, function(err,user){
//     if (err) {
//         res.json({success: false, message: 'Password could not be saved. 
//       Please try again!'})
//     } else { 
//       res.json({success: true, message: 'Your new password has been saved 
//     successfully'})
//     }
// });