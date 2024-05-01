const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    leaveDate: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    permissionDetails: {
        type: String,
        required: true
    },
    assignmentAssignedTo: {
        type: String,
        required: true
    }
})
const Leave= mongoose.model('leaves', leaveSchema);

module.exports = Leave