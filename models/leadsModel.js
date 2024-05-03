const mongoose=require('mongoose')

const leadsSchema = new mongoose.Schema({
    name: {
        type: String
    },
    serial_number: {
        type: String
    },
    phone_number: {
        type: String
    },
    email: {
        type: String
    },
    excel_type:{
        type: String
    },
    city:{
        type: String
    },
    uploaded_by:{
        type: String
    },
    uploaded_crm_name:{
        type: String
    }
})

module.exports = mongoose.model('leads', leadsSchema)