const mongoose = require('mongoose')
const crmSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    }
})

const crms = mongoose.model('crms', crmSchema)

module.exports = crms