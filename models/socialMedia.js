const mongoose = require('mongoose')

const socialMediaSchema = new mongoose.Schema({
    website:{
        type: String,
    },
    instagram:{
        type: String,
    },
    facebook:{
        type: String,
    },
    whatsapp:{
        type: String,
    },
    youtube:{
        type: String,
    },
    email:{
        type: String,
    },
    location:{
        type: String,
    }
})

const socialmedialinks = mongoose.model("socialmedialinks",socialMediaSchema)
module.exports = socialmedialinks