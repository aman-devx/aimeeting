const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, "Email required"]
    },
    picture: {
        type: String,
    },
    password: {
        type: String,
        required: [true, "Password required"]
    },
    createvia: {
        type: String,
    },
}, { timestamps: true })

UserSchema.index({ email: 1}, { unique: true }); 

const User = mongoose.model('User', UserSchema);
User.createIndexes();
module.exports = User;