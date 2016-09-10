const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    twitchId: {
        type: String,
        required: true
    },
    clips: {
        type: Array
    }
})

const User = mongoose.model('User', UserSchema)

module.exports = User
