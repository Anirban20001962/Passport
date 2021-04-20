const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
	},
});
userSchema.methods.validPassword = async (password, hashPassword) => {
	const compare = await bcrypt.compare(password, hashPassword);
	return compare;
};
module.exports = mongoose.model('user', userSchema);
