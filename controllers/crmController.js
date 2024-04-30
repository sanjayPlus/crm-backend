const CRM = require('../models/crmModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const assignment = require('../models/Assignments')

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

const protected = async (req, res) => {
    try {
      if (req.crm) {
        res.status(200).json({ message: "You are authorized" });
      } else {
        res.status(400).json({ message: "You are not authorized" });
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

// AdminLogin

const crmLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const crm = await CRM.findOne({ email })
        if (!crm) {
            return res.status(401).json({ message: "CRM not found" })
        }
        if(!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
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

const getCRMDetails = async (req, res) => {
    try {
        const crm = await CRM.findById(req.crm.id).select('-password');
        
        res.status(200).json({ crm });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
}

const addAssignments = async (req, res) => {
    try {
        const { title, subject, assignmentType, issueDate, dueDate, priority,status } = req.body;
        const assignments = await assignment.create({
            title,
            subject,
            assignmentType,
            issueDate,
            dueDate,
            priority,
            status
            
        });
        const cacheDate = await assignment.find().sort({ _id: -1 });
        Cache.set('assignments', cacheDate, catchTime);
        res.status(200).json({ assignments });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
}

module.exports = {
    register,
    crmLogin,
    getCRMDetails,
    protected,
    addAssignments,
}