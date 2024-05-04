const CRM = require('../models/crmModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const assignment = require('../models/Assignments')
const Cache = require('../middlewares/Cache');
const Leave = require('../models/Leave');
const users = require('../models/userModel');
const catchTime = 600;
const XLSX = require('xlsx');
const leadsModel  =require('../models/leadsModel')
const fs=require('fs')

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
        const { title, subject, assignmentType, issueDate, dueDate, priority,status,createdBy } = req.body;
        const assignments = await assignment.create({
            title,
            subject,
            assignmentType,
            issueDate,
            dueDate,
            priority,
            status,
            createdBy: req.crm.id
            
        });
        const cacheDate = await assignment.find().sort({ _id: -1 });
        Cache.set('assignment', cacheDate, catchTime);
        res.status(200).json({ assignments });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
}

const addLeave = async (req, res) => {
    try{
        const{ leaveDate,duration,permissionDetails,assignmentAssignedTo } = req.body;
        const leave = await Leave.create({
            leaveDate,
            duration,
            permissionDetails,
            assignmentAssignedTo

        })
        const leavecache = await Leave.find().sort({ _id: -1 });
        Cache.set('leave', leavecache, catchTime);
        res.status(200).json({ leave });
    }catch(error){
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error.message);
    }

};

// add data from excel
const excelfileupload = async (req, res) => {
    try {
        
        if (!req.file) {
            return res.status(400).send('No file uploaded.'); 
        }

        const excelFilePath = req.file.path;
        const workbook = XLSX.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const documents = jsonData.map((item,index) => {
            const { name, phoneno } = item;
            return { name, phoneno, leadno:index+1 };
        });

        const insertedDocuments = await leadsModel.insertMany(documents);
        res.status(200).json(insertedDocuments); 
    } catch (error) {
        console.error('Error processing Excel file:', error);
        res.status(500).send('Internal Server Error');
    }
    // finally{
    //     fs.unlinkSync(req.file.path);
    //     console.log('deleted successfully');
    // }
};

// get all leads
const getleads=async(req,res)=>
{
    try {
        const data = await leadsModel.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
}

// get leads by id
const getleadsbyid=async(req,res)=>
{
    const {id}=req.params;
    // console.log(id);
    try {
        const data = await leadsModel.findById(id);
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
}


const addUsers = async(req,res)=>{
     try {
        const {name,email,password,
            users_type,phone_number,whatsapp,facebook,instagram,registeration_fee,
            registeration_date,documentation_date,documentation_fee,address,
            location,age,qualification,program_type,language_status,teachers,teacherid,home,
            training_fee,no,date,fee,batch,preparation_fee,profile_image,crm_joinId,visits,visitdate}=req.body;

            const usersDetails = await users.create({name,email,password,
                users_type,phone_number,whatsapp,facebook,instagram,registeration_fee,
                registeration_date,documentation_date,documentation_fee,address,teachers:[],training_fee:[],
                location,age,qualification,program_type,language_status,
                no,date,fee,batch,preparation_fee,
                profile_image:`${process.env.DDOMAIN}/user/${imgObj.filenme}`,
                crm_joinId,visits:[],visitdate
                
            })
            usersDetails.teachers.push({teacherid,home})
            usersDetails.training_fee.push({no,date,fee})
            usersDetails.visits.push({visitdate})

            await usersDetails.save()

            res.status(200).json({usersDetails})

     } catch (error) {
        console.log("error");
        res.status(500).json({ error: "Internal Server Error", message: error.message });

     }
};

const getUsers =async(req,res)=>{
    try {
      
        const getUsersDetails = await users.find({});
        
         res.status(200).json(getUsersDetails)
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

const deleteUser =async(req,res)=>{
    try {
        const deleteUsers= await users.findByIdAndDelete({_id: req.params.id})
        res.status(200).json(deleteUsers)
    } catch (error) {

    res.status(500).json({ error: "Internal Server Error", message: error.message });

    }
};




module.exports = {
    register,
    crmLogin,
    getCRMDetails,
    protected,
    addAssignments,
    addLeave,
    excelfileupload,
    getleads,
    getleadsbyid,
    addUsers,
    getUsers,
    deleteUser
}