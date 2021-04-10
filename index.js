const express = require('express')
const path = require('path')
const passport = require('passport')
const mongoose = require('mongoose')
const session = require('express-session')
const app = express()
const database_URI = ''
const User = require('./models/User')
const {signup,login} = require('./controller/user')

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
    secret: "keyissecret",
    resave: true,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

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

app.post('/signup',signup);

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