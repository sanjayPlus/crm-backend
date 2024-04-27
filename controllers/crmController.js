const CRM = require('../models/crmModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// register
exports.register = async (req, res) => {
    console.log("Inside register API");
    try {
        const {name,email,password} = req.body
        const existingCRM = await CRM.findOne({email});
        if(existingCRM) {
            return res.status(400).json({message: "CRM already exists"});
        }else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const newCRM = await CRM.create({
                name,
                email,
                password: hashedPassword
            })
            res.status(200).json({newCRM})
        }
        
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// AdminLogin

exports.crmLogin = async(req, res) => {
    try {
        const {email, password} = req.body
        const crm = await CRM.findOne({email})
        if(!crm){
          return  res.status(401).json({message: "CRM not found"})
        }
        
    // check password
        const matchPassword = await bcrypt.compare(password, crm.password)
        if (!matchPassword) {
            return res.status(400).json({ msg: "Invalid Credentials" })
        }
        const token  = jwt.sign({id: crm._id}, process.env.JWT_CRM_SECRET_KEY)
        res.status(200).json({token})
    
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal Server Error"})
    }
}