const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
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
    users_type:{
        type:String,
        required:true
    },
    phone_number:{
        type:String,
        required:true
    },
    whatsapp:{
        type:String,
        required:true

    },
    facebook:{
        type:String,
        required:true
    },
    instagram:{
        type:String,
        required:true
    },
    registeration_fee:{
        type:String,
        required:true
    },
    registeration_date:{
        type:String,
        required:true
    },
    documentation_date:{
        type:String,
        required:true
    },
    documentation_fee:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    age:{
        type:String,
        required:true
    },
    qualification:{
        type:String,
        required:true
    },
    program_type:{
        type:String,
        required:true
    },
    language_status:{
        type:String,
        required:true
    },
    teachers:[{
        teacherid:{
            type:String,
            required:true
        },
        home:{
            type:String,
            required:true
        }
    }],
    training_fee:[{
        no:{
            type:String,
            required:true
        },
        date:{
            type:String,
            required:true
        },
        fee:{
            type:String,
            required:true
        },
    }],
    batch:String,
    preparation_fee:String,
    profile_image:String,
    crm_joinId:String,
    visits:[{
        visitdate:{
            type:String,
            required:true
        }
    }]


})

const users = mongoose.model('users', userSchema)

module.exports = users