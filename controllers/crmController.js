const CRM = require('../models/crmModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// register
const register = async (req, res) => {
    console.log("Inside register API");
    try {
        const { name, email, password } = req.body;
        const existingCRM = await CRM.findOne({ email });
        if (existingCRM) {
            return res.status(400).json({ message: "CRM already exists" });
        }
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
         // Validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        // Validate password strength (add your own criteria)
        if (password.length < 6) {
            return res
                .status(400)
                .json({ error: "Password must be at least 6 characters long." });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newCRM = await CRM.create({
            name,
            email,
            password: hashedPassword
        })
        res.status(200).json({ newCRM })


    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// AdminLogin

const crmLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const crm = await CRM.findOne({ email })
        if (!crm) {
            return res.status(401).json({ message: "CRM not found" })
        }

        // check password
        const matchPassword = await bcrypt.compare(password, crm.password)
        if (!matchPassword) {
            return res.status(400).json({ msg: "Invalid Credentials" })
        }
        const token = jwt.sign({ id: crm._id }, process.env.JWT_CRM_SECRET_KEY)
        res.status(200).json({ token })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" })
    }
}

module.exports = {
    register,
    crmLogin
}