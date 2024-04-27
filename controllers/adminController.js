const Admin = require('../models/adminModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// register
exports.register = async (req, res) => {
    console.log("Inside register API");
    try {
        const {name,email,password} = req.body
        const existingAdmin = await Admin.findOne({email});
        if(existingAdmin) {
            return res.status(400).json({message: "Admin already exists"});
        }else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const newAdmin = await Admin.create({
                name,
                email,
                password: hashedPassword
            })
            res.status(200).json({newAdmin})
        }
        
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// AdminLogin

exports.adminLogin = async(req, res) => {
    try {
        const {email, password} = req.body
        const admin = await Admin.findOne({email})
        if(!admin){
          return  res.status(401).json({message: "Admin not found"})
        }
        
    // check password
        const matchPassword = await bcrypt.compare(password, admin.password)
        if (!matchPassword) {
            return res.status(400).json({ msg: "Invalid Credentials" })
        }
        const token  = jwt.sign({id: admin._id}, process.env.JWT_ADMIN_SECRET_KEY)
        res.status(200).json({token})
    
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal Server Error"})
    }
}