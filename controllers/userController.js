const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// register
exports.register = async (req, res) => {
    console.log("Inside register API");
    try {
        const {name,email,password} = req.body
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({message: "User already exists"});
        }else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({
                name,
                email,
                password: hashedPassword
            })
            res.status(200).json({newUser})
        }
        
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// userLogin

exports.userLogin = async(req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
          return  res.status(401).json({message: "User not found"})
        }
        
    // check password
        const matchPassword = await bcrypt.compare(password, user.password)
        if (!matchPassword) {
            return res.status(400).json({ msg: "Invalid Credentials" })
        }
        const token  = jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY)
        res.status(200).json({token})
    
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal Server Error"})
    }
}