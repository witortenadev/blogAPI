const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, 
    },
    email: {
        type: String,
        required: true, 
        unique: true,  
        trim: true      
    },
    password: {
        type: String,
        required: true,
    },
    starredPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

const User = new mongoose.model('User', UserSchema)
module.exports = User