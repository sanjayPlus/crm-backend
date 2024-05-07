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
    phone1: {
        type: String,
        required: true
    },
    phone2: {
        type: String,
        required: true
    },
    whatsapp: {
        type: String,
        required: true
    },
    instagram: {
        type: String,
        required: true
    },
    address:{
        type:String
    },

    dateofBirth: {
        type: String,
        required: true
    },
    program: Array,
    guardian: [{
        guardian_name: {
            type: String,
            required: true
        },
        guardian_phone: {
            type: String,
            required: true
        }
    }],
    joingdate: {
        type: String,
        required: true
    },
    attendence: [{
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        }
    }],
    leave: [{
        date: {
            type: String,
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        half_day: {
            type:Boolean,
        },
        assignment_transferedId: {
            type: String,
            required: true
        },
    }],
    salary: {
        type: String,
        required: true
    },
    incentive: [{
        date: {
            type: String,
            required: true
        },
        price: {
            type: String,
            required: true
        },
    }],
    refund: [{
        date: {
            type: String,
            required: true
        },
        price: {
            type: String,
            required: true
        },
    }],
    tasks:[{
        date:{
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        assignment_type:{
            type:String,
            required:true
        },
        priority:{
            type:String,
            required:true
        },
        status:{
            type:String,
            required:true
        },
        issue_date:{
            type:String,
            required:true
        },
        due_date:{
            type:String,
            required:true
        }
        
    }],
    otp:{
        type:Number
    }

})

const crms = mongoose.model('crms', crmSchema)

module.exports = crms