const mongoose = require('mongoose');

const calenderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
   
})
const Calender = mongoose.model('calender', calenderSchema);

module.exports = Calender