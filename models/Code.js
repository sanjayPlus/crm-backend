// models/Code.js
const mongoose = require('mongoose');

const CodeSchema = new mongoose.Schema({
    date: Date,
    time: String,
    code: String
});

module.exports = mongoose.model('Code', CodeSchema);
