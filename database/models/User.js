const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,  // username is required
    },
    email: {
        type: String,
        required: true,  // email is required
        unique: true,    // email must be unique
        trim: true       // trims leading/trailing spaces
    },
    password: {
        type: String,
        required: true,  // password is required
    }
});

const User = new mongoose.model('User', UserSchema)
module.exports = User