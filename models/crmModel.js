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
    },
    phoneno:{
        type:String,
        required:true
    },
    dateofBirth:{
        type:String,
        required:true
    },
    program:{
        type:String,
        required:true
    },
    guardian:{
        type:String,
        required:true
    },
    joingdate: {
        type:String,
        required:true
    },
    salary: {
        type:String,
        required:true
    },
    image: {
        type: String,
        required: true
    },
    
})

const crms = mongoose.model('crms', crmSchema)

module.exports = crms