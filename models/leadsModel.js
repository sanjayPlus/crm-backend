const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: String,
    serial_number: String,
    phone_number: String,
    email: String,
    excel_type: String,
    city: String,
    uploaded_by: String,
    uploaded_crm_name: String,
    status: String
});

const leadSchemaByCrm = new mongoose.Schema({
    createdBy: String,
    leadsByCrm: [leadSchema] // Array of leads documents following the leadSchema structure
});

const leads = mongoose.model('leads', leadSchemaByCrm);

module.exports = leads;