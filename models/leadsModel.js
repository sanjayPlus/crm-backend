const mongoose=require('mongoose')

const leadsSchema = new mongoose.Schema({
    name: {
        type: String
    },
    phoneno: {
        type: String
    },
    leadno: {
        type: String
    },
})

module.exports = mongoose.model('leads', leadsSchema)