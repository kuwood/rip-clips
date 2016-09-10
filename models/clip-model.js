const mongoose = require('mongoose')

const ClipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    game: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    twitchId: {
        type: String,
        required: true
    }
})

const Clip = mongoose.model('Clip', ClipSchema)

module.exports = Clip
