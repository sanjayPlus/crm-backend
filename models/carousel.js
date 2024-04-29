const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
})
const carousels = mongoose.model('carousels', carouselSchema);

module.exports = carousels