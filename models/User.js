const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username:{
        type: String
    }
    ,password:{
        type: String
    },
    googleId: {
        type: String
    }
})
userSchema.methods.validPassword = ( pwd ) => {
    // EXAMPLE CODE!
    console.log(this.password === pwd )
    return ( this.password === pwd );
};
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('user',userSchema)