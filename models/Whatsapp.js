const mongoose  = require('mongoose')

const whatsappSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
})
const whatsapp = mongoose.model('whatsapp', whatsappSchema)
module.exports = whatsapp 