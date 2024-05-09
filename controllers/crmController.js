const CRM = require('../models/crmModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const assignment = require('../models/Assignments')
const Cache = require('../middlewares/Cache');
const Leave = require('../models/Leave');
const users = require('../models/userModel');
const Calender = require('../models/Calender')
const catchTime = 600;
const XLSX = require('xlsx');
const fs=require('fs')
const nodemailer = require('nodemailer');
const { query } = require('express');
const leads = require('../models/leadsModel');
const { log } = require('console');


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
            password: hashedPassword,
            
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
        const { title, subject, assignmentType, issueDate, dueDate, priority} = req.body;
        const crmModel = await CRM.findById(req.crm.id);
        if (!crmModel) {
            return res.status(404).json({ error: "Crm not found" });
        }
        const assignments = {
            title,
            subject,
            assignmentType,
            issueDate,
            dueDate,
            priority,
            createdBy: req.crm.id,
        }
        crmModel.tasks.push(assignments);
        await crmModel.save();
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

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


// add calenderevents by crm
const addCalenderEvents = async (req, res) => {
    try {
        const {id} = req.crm
        console.log(id);
        const { title, description, date } = req.body;
        if (!title || !description || !date) {
            return res.status(400).json({ error: " fields not found" });
        }

        const calenderEvents = await Calender.create({
            title,
            description,
            date,
            createdBy: id
        })    
        res.status(200).json(calenderEvents);

    } catch (error) {
        console.log("error");
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// get calender events by crm
const getCalenderEventByCrm = async(req,res)=>{
        try {
            const {id} = req.crm
            const {date} = req.query
            let query = {}

            if(date){
                query.date = date
            }
            // get calender Event by crm and query
            const calenderEvent = await Calender.find({createdBy: id, ...query})
            if(calenderEvent.length>0){
                res.status(200).json(calenderEvent)
            }else{
                return res.status(400).json({error:"No calender events found"})
            }
           
        } catch (error) {
            res.status(500).json({error:`Internal Server Error: ${error.message}` })
        }          
}

// delete calender event

const deleteCalenderEvent = async (req, res) => {
    try {
        const {id} = req.params
        const calenderEvent = await Calender.findByIdAndDelete(id)
        res.status(200).json(calenderEvent)
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}

// add data from excel
const addleadsByExcelUpload = async (req, res) => {
    const { id, name } = req.crm;
    try {
        const { excel_type } = req.body;
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const buffer = req.file.buffer;
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const dataArray = jsonData.map((row, index) => {
            return {
                serial_number: index + 2,
                name: row.full_name,
                email: row.email,
                phone_number: row.phone_number,
                city: row.city,
                excel_type,
                uploaded_by: id,
                uploaded_crm_name: name,
                status: 'Pending' // Default status
            };
        });

        // Find or create leads document for the CRM system
        let leadsDocument = await leads.findOne({ createdBy: id });
        if (!leadsDocument) {
            leadsDocument = new leads({
                createdBy: id,
                leadsByCrm: []
            });
            leadsDocument.leadsByCrm.push(...dataArray);
        }else{
             // Push the new leads data into the leadsByCrm array
           leadsDocument.leadsByCrm.push(...dataArray);
        }
        // save the data in to mongodb
        await leadsDocument.save()
        res.status(200).json(leadsDocument);
    } catch (error) {
        console.error('Error processing Excel file:', error);
        res.status(500).send('Internal Server Error');
    }
};

// add leads manually
const addleadsManually = async (req, res) => {
    const { id } = req.crm;
    const { serial_number, name, email, phone_number, city,excel_type } = req.body;
    const uploaded_by = id;

    try {
        // Validate input fields if necessary
        
        const leadsObj = {
            serial_number,
            name,
            email,
            phone_number,
            city,
            excel_type,
            uploaded_by
        };

        let leadsDocument = await leads.findOne({ createdBy: id });

        if (!leadsDocument) {
            leadsDocument = new leads({
                createdBy: id,
                leadsByCrm: []
            });
        }

        leadsDocument.leadsByCrm.push(leadsObj);   
        // Save the data to MongoDB
        await leadsDocument.save();

        // Respond with a success message or relevant information
        res.status(200).json({ message: "Lead added successfully", lead: leadsObj });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};
  
// get all leads
const getleads=async(req,res)=>{
    const {id} = req.crm
    try {
        const data = await leads.find({createdBy:id});
        // if no data added by the id
        if(data.length===0){
            return res.status(400).json({error:"No leads found"})
        }else{
            res.status(200).json(data);
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
}

// get leads by id
const getleadsbyid=async(req,res)=>
{
    const crmId = req.crm.id
    const {id}=req.params;
    // console.log(id);
    try {
        const data = await leads.find({createdBy:crmId});
        if(!data){
            return res.status(400).json({error:"No lead found"})
        }else{
            // find leadsCrm array from leads
            const leadsCrm = data[0].leadsByCrm
            console.log(leadsCrm);
            const lead = leadsCrm.find((lead) => lead._id.toString() === id);
            if (!lead) {
                return res.status(404).json({ error: "Lead not found" });
            } else {
                res.status(200).json(lead);
            }
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
}

// search leads by  name or phone number
const searchLeadsByName = async (req, res) => {
    const {id} = req.crm;
    const searchKey = req.query.search;
    try {
        // Find leads document for the CRM system
        const leadsDocument = await leads.findOne({ createdBy: id });
        if (!leadsDocument) {
            return res.status(404).json({ error: "No leads found." });
        }else{
            // Search by name or phone number using aggregation pipeline
        const allLeads = await leads.aggregate([
            // Unwind the leadsByCrm array to flatten it
            { $unwind: "$leadsByCrm" },
            // Match leads where name or phone number matches the search key
            {
                $match: {
                    $or: [
                        { "leadsByCrm.name": { $regex: searchKey, $options: 'i' } }, // Case-insensitive regex for name
                        { "leadsByCrm.phone_number": { $regex: searchKey, $options: 'i' } } // Case-insensitive regex for phone number
                    ]
                }
            }
        ]);

        // If leads matching the search query are found
        if (allLeads.length > 0) {
            res.status(200).json(allLeads);
        } else {
            return res.status(404).json({ error: "No leads found." });
        }

        }   
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

// fliter leads by excel type
const filterLeadsByExcelType = async (req, res) => {
    const {id} = req.crm;
    const excelType = req.query.excelType;
    try {
        const leadsDocument = await leads.findOne({ createdBy: id });
        if (!leadsDocument) {
            return res.status(404).json({ error: "No leads found." });
        }else{
            const filteredLeads = leadsDocument.leadsByCrm.filter((lead) => lead.excel_type.toLowerCase() === excelType.toLowerCase());
            const count = filteredLeads.length;
            if (filteredLeads.length > 0) {
                res.status(200).json({count:count,filteredLeads});
            }else{
                return res.status(404).json({ error: "No leads found." });
            }
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
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
                registeration_date,documentation_date,documentation_fee,address,teachers,teacherid,home,training_fee,
                location,age,qualification,program_type,language_status,
                no,date,fee,batch,preparation_fee,
                profile_image:`${process.env.DDOMAIN}/user/${imgObj.filenme}`,
                crm_joinId,visits,visitdate
                
            })
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

// forgot password
const forgotpassword = async (req, res) => {
    console.log("password");
    try {
        const { email } = req.body;

        // Find CRM details by email
        const crmdetails = await CRM.findOne({ email });

        // If CRM not found, return error response
        if (!crmdetails) {
            return res.status(404).json({ message: "CRM not found" });
        }

        // Generate random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sanjayckz789@gmail.com',
                pass: 'camr qilf bdgg segf'
            }
        });

        // Define email content
        const mailOptions = {
            from: 'sanjayckz789@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`
        };

        // Send OTP email
        await transporter.sendMail(mailOptions);

        // Assuming your CRM schema has an 'otp' field, save the OTP to CRM document
        crmdetails.otp = otp;
        await crmdetails.save();

        // Send success response
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error.message);
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

// verify otp
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
            console.log(email,otp);
        // Find CRM details by email
        
        const crmdetails = await CRM.findOne({ email });
        console.log(crmdetails);
        if(!email){
            return res.status(404).json({ message: "Email not found" });

        }
        // verify otp

        if (crmdetails.otp === parseInt(otp)) {
            res.status(200).json({ message: "OTP verified successfully" });
            console.log(crmdetails.otp);
        }
        else {
            res.status(400).json({ message: "Invalid OTP" });
        }

    }catch(error){
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}

// reset password
    const resetPassword = async (req, res) => {
        const {id} = req.params
        try {
            const { confirmPassword, password } = req.body; 
           
            const crmdetails = await CRM.findById(id);

            if(confirmPassword === password){
                const hashedPassword = await bcrypt.hash(password, 10);

                crmdetails.password = hashedPassword;
                await crmdetails.save();
                 
                // Send success response
                res.status(200).json({ message: "Password reset successfully" });

            }else{
                res.status(400).json({ message: "Passwords do not match" });
            }

        } catch (error) {
            res.status(500).json({ error: "Internal Server Error", message: error.message });
        }
    }

module.exports = {
    register,
    crmLogin,
    getCRMDetails,
    protected,
    addAssignments,
    addLeave,
    addCalenderEvents,
    addleadsByExcelUpload,
    getleads,
    getleadsbyid,
    addUsers,
    getUsers,
    deleteUser,
    forgotpassword,
    verifyOtp,
    resetPassword,
    getCalenderEventByCrm,
    deleteCalenderEvent,
    searchLeadsByName,
    filterLeadsByExcelType,
    addleadsManually
}