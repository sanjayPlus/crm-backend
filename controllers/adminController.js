const Admin = require('../models/adminModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Carousel = require('../models/carousel')
const Cache = require('../middlewares/Cache');
const catchTime = 400;
const fs = require('fs');
const path = require('path');
const Calender = require('../models/Calender');
const crms = require('../models/crmModel');
const assignment = require('../models/Assignments');
const Leave = require('../models/Leave');
const XLSX = require('xlsx');
const socialMedia = require('../models/socialMedia');
const Code = require('../models/Code');
const crypto = require('crypto');
const whatsapp = require('../models/Whatsapp');
const leads = require('../models/leadsModel');
// const QRCode = require('qrcode');
// register
// const register = async (req, res) => {
//     console.log("Inside register API");
//     try {
//         const {name,email,password} = req.body
//         const existingAdmin = await Admin.findOne({email});
//         if(existingAdmin) {
//             return res.status(400).json({message: "Admin already exists"});
//         }else{
//             const hashedPassword = await bcrypt.hash(password, 10);
//             const newAdmin = await Admin.create({
//                 name,
//                 email,
//                 password: hashedPassword
//             })
//             res.status(200).json({newAdmin})
//         }

//     } catch (error) {
//         res.status(500).json({error: error.message});
//     }
// }

// AdminLogin
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const admin = await Admin.findOne({ email })
        if (!admin) {
            return res.status(401).json({ message: "Admin not found" })
        }

        // check password
        const matchPassword = await bcrypt.compare(password, admin.password)
        if (!matchPassword) {
            return res.status(400).json({ msg: "Invalid Credentials" })
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_ADMIN_SECRET_KEY)
        res.status(200).json({ token })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" })
    }
}

const Protected = async (req, res) => {
    try {
        if (req.admin) {
            res.status(200).json({ message: "You are authorized" });
        } else {
            res.status(400).json({ message: "You are not authorized" });
        }
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const addCarousel = async (req, res) => {
    try {
        const { title, description, link } = req.body;
        const imgObj = req.file;

        if (!imgObj || !imgObj.filename) {
            // Handle the case where the image file is missing or doesn't have a filename
            return res.status(400).json({ error: "Image file is missing or invalid" });
        }
        const newcarousel = await Carousel.create({
            title,
            description,
            link,
            image: `${process.env.DOMAIN}/carousel/${imgObj.filename}`
        });

        const carouselCache = await Carousel.find().sort({ _id: -1 });
        Cache.set('carousel', carouselCache, catchTime);

        res.status(200).json({ newcarousel });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
};

const getCarousel = async (req, res) => {
    try {
        const carouselCache = await Cache.get('carousel');
        if (carouselCache) {
            return res.status(200).json(carouselCache);
        }
        const carousel = await Carousel.find().sort({ _id: -1 });
        Cache.set('carousel', carousel, catchTime);
        res.status(200).json({ carousel });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
};

// const getCarousel = async (req, res) => {
//     try {
//         const carousel = await Carousel.find().sort({ _id: -1 });
//         res.status(200).json({ carousel });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error", message: error.message });
//         console.error(error);
//     }
// }

// const getCarouselById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const carouselcache = await Cache.get(`carousel_${id}`);
//         if (carouselcache) {
//             return res.status(200).json(carouselcache);  
//         }
//         const carousel = await Carousel.findById(id);
//         Cache.set(`carousel_${id}`, carousel, catchTime);

//         res.status(200).json({ carousel });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error", message: error.message });
//         console.error(error);
//     }
// };




const deleteCarousel = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCarousel = await Carousel.findByIdAndDelete({ _id: id });
        if (!deletedCarousel) {
            return res.status(404).json({ error: "Carousel not found" });
        }

        // Extract the filename from the full URL
        const imageUrl = deletedCarousel.image;
        const filename = imageUrl.split('/').pop(); // Get the last part (filename)

        // Construct the path to the image file
        const imagePath = path.join('carousel', filename);

        // Check if the file exists before trying to delete it
        if (fs.existsSync(imagePath)) {
            // Delete the image file
            fs.unlinkSync(imagePath);
        } else {
            console.log(`File not found: ${imagePath}`);
        }

        // Update the carousel cache
        const carouselCache = await Carousel.find().sort({ _id: -1 });
        Cache.set('carousel', carouselCache, catchTime);

        res.status(200).json({ message: "Carousel deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
};



const updateCarousel = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, link } = req.body;
        const imgObj = req.file;


        // Find the carousel item first
        const carouselItem = await Carousel.findById(id);
        if (!carouselItem) {
            return res.status(404).json({ error: "Carousel not found" });
        }   
        // Construct the path to the old image file
        const oldImageFilename = carouselItem.image;
        const filename = oldImageFilename.split('/').pop(); // Get the last part (filename)
        const oldImagePath = path.join('carousel', filename);

        // Check if the old image file exists before trying to delete it
        if (fs.existsSync(oldImagePath)) {
            // Delete the old image file
            fs.unlinkSync(oldImagePath);
        }

        // Update the carousel item
        if (title) {
            carouselItem.title = title;
        }
        if (description) {
            carouselItem.description = description;
        }
        if (link) {
            carouselItem.link = link;
        }

        if (imgObj) {
            carouselItem.image = `${process.env.DOMAIN}/carousel/${imgObj.filename}`;
        }
        // Save the updated carousel item
        const updatedCarousel = await carouselItem.save();

        // // Update the carousel cache
        const carouselCache = await Carousel.find().sort({ _id: -1 });
        Cache.set('carousel', carouselCache, catchTime);

        // Update the cache for the individual item
        Cache.set(`carousel_${id}`, updatedCarousel, catchTime);

        // Send the response after the cache is updated
        res.status(200).json({ message: "Carousel updated successfully", updatedCarousel });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
};

const getCarouselById = async (req, res) => {
    try {
        const { id } = req.params;
        const carouselcache = await Cache.get(`carousel_${id}`);
        if (carouselcache) {
            return res.status(200).json(carouselcache);
        }
        const carousel = await Carousel.findById(id);
        Cache.set(`carousel_${id}`, carousel, catchTime);

        res.status(200).json({ carousel });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
};

// const getCarouselById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const carousel = await Carousel.findById(id);
//         res.status(200).json({ carousel });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error", message: error.message });
//         console.error(error);
//     }
// };

const addCalenderEvents = async (req, res) => {
    try {
        const { title, description, date } = req.body;
        if (!title || !description || !date) {
            return res.status(400).json({ error: " fields not found" });
        }
        const calenderEvents = await Calender.create({
            title,
            description,
            date
        })
        res.status(200).json(calenderEvents);
    } catch (error) {
        console.log("error");
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getCalenderEvents = async (req, res) => {
    try {
        const calenderEvents = await Calender.find().sort({ _id: -1 });
        res.status(200).json({ calenderEvents });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getCalenderEventsById = async (req, res) => {
    try {
        const { id } = req.params;
        const calenderEvents = await Calender.findById(id);
        res.status(200).json({ calenderEvents });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const deleteCalenderEvents = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCalenderEvents = await Calender.findByIdAndDelete(id);
        if (!deletedCalenderEvents) {
            return res.status(404).json({ error: "Calender not found" });
        }

        res.status(200).json({ message: "Calender deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const addCrm = async (req, res) => {
    try {
        const { name, email, password, phone1, phone2, whatsapp, instagram, address, 
            guardian_name, guardian_phone, dateofBirth, program, joingdate, salary, idno, assets } = req.body;
            
        const imgObj = req.file; // Main image
       const offerLetterObj = req.files.offerLetter ? req.files.offerLetter[0].filename : null; // Offer letter
        const provisionalCertificateObj = req.files.provisionalCertificate ? req.files.provisionalCertificate[0].filename : null;
        console.log(offerLetterObj,provisionalCertificateObj);

        const hashedPassword = await bcrypt.hash(password, 10);

        const newGuardian = {
            guardian_name,
            guardian_phone
        };
        
        const newDocument ={
            offerLetter: `${process.env.DOMAIN}/crm/${offerLetterObj}`,
            provisionalCertificate: `${process.env.DOMAIN}/crm/${provisionalCertificateObj}`
        };

        const crmDetails = await crms.create({
            name,
            email,
            password: hashedPassword,
            phone1,
            phone2,
            whatsapp,
            instagram,
            address,
            guardian: [newGuardian],
            dateofBirth,
            program,
            joingdate,
            salary,
            image: `${process.env.DOMAIN}/crm/${imgObj}`,
            idno,
            documents: [newDocument],
            assets
        });

        await crmDetails.save();

        res.status(200).json({ message: "CRM added successfully", crmDetails });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};


const getCrm = async (req, res) => {
    try {
        const crm = await crms.find().sort({ _id: -1 });
        res.status(200).json(crm);

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);

    }
}

const getCrmById = async (req, res) => {
    try {
        const { id } = req.params;
        const crm = await crms.findById(id);
        res.status(200).json({ crm });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
}
const updateCrm = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone1, phone2, whatsapp, instagram, address, guardian,
        dateofBirth, program, joingdate, salary, image, incentive, idno } = req.body;
        const crm = await crms.findById(id);
        if (!crm) {
            return res.status(404).json({ error: "Crm not found" });
        }
        if (name) {
            crm.name = name;
        }
        if (email) {
            crm.email = email;
        }

        if (phone1) {
            crm.phone1 = phone1;
        }
        if (phone2) {
            crm.phone2 = phone2;
        }
        if (whatsapp) {
            crm.whatsapp = whatsapp;
        }
        if (instagram) {
            crm.instagram = instagram;
        }
        if (address) {
            crm.address = address;
        }

       // if(guardian_name&& guardian_phone){
       //  crm.guardian[0].guardian_name = guardian_name;
       //  crm.guardian[0].guardian_phone = guardian_phone;
       // }
     if(guardian){
      crm.guardian = guardian
     }
        if (dateofBirth) {
            crm.dateofBirth = dateofBirth;
        }
        if (program) {
            crm.program = program;
        }
        if (joingdate) {
            crm.joingdate = joingdate;
        }
        if (salary) {
            crm.salary = salary;
        }
        if (image) {
            crm.image = image;
        }
        if (incentive) {
            crm.incentive = incentive;
        }
        if (idno) {
            crm.idno = idno;
        }
        await crm.save();
        res.status(200).json({ message: "Crm updated successfully", crm });
    } catch (error) {
        
    }
}
const deleteCrm = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCrm = await crms.findByIdAndDelete(id);
        if (!deletedCrm) {
            return res.status(404).json({ error: "Crm not found" });
        }
        res.status(200).json({ message: "Crm deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// const addleadsByExcelUpload = async (req, res) => {
//     try {
//         const{excel_type} = req.body;
//         if (!req.file) {
//             return res.status(400).send('No file uploaded.'); 
//         }

//         const buffer = req.file.buffer;
//         const workbook = XLSX.read(buffer, { type: 'buffer' });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const jsonData = XLSX.utils.sheet_to_json(worksheet);
//         const fields = Object.keys(jsonData[0]);
//         const dataArray = jsonData.map((row,index) => {
//             const dataObjects = {};
//             fields.forEach((field)=>{
//                 dataObjects[field] = row[field];
//             });
//             dataObjects.serial_number = index + 2;
//             return dataObjects;

//         })

//         dataArray.map(async (data) => {
//             const leads = await leadsModel.create({
//                 serial_number: data.serial_number,
//                 name: data.full_name,
//                 email: data.email,
//                 phone_number: data.phone_number,
//                 city: data.city,
//                 excel_type,
//                 uploaded_by:req.admin.id,
//                 uploaded_crm_name: req.admin.name
//             });
//         })

//         res.status(200).json({ message: "Data inserted successfully", dataArray });
//     } catch (error) {
//         console.error('Error processing Excel file:', error);
//         res.status(500).send('Internal Server Error');
//     }

// };

// const deleteallleads = async (req, res) => {
//     try {
//         const deletedleads = await leadsModel.deleteMany();
//         res.status(200).json({ message: "leads deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }

const getLeads = async (req, res) => {
    try {
        const allLeads = await leads.find();
        res.status(200).json({ allLeads });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// const deleteLeads = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const deletedleads = await leads.findByIdAndDelete(id);
//         res.status(200).json({ message: "leads deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }

const getleadstotalcount = async (req, res) => {
    try {
        const count = await leadsModel.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}

const addAssignments = async (req, res) => {
    try {
        const { title, subject, assignmentType, issueDate, dueDate, priority, assignedTo } = req.body;
        const crmModel = await crms.findById(assignedTo);
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
            createdBy: req.admin.id,
        }
        crmModel.tasks.push(assignments);
        await crmModel.save();
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

const getAllAssignments = async(req,res) =>{
    try {
        const assignments = await crms.find().select('tasks')
        res.status(200).json(assignments)
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}

const getEachCrmAssignments = async(req,res) =>{
    try {
        const {id} = req.params
        const assignments = await crms.findById(id).select('tasks')
        res.status(200).json(assignments)
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}

const getEachAssignments = async(req,res) =>{
    try {
        const {crmId, taskId} = req.params;
        const crm = await crms.findById(crmId);
        if(!crm){
            return res.status(404).json({error:"Crm not found"});
        }
        const task = crm.tasks.id(taskId);
        if(!task){
            return res.status(404).json({error:"Task not found"});
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}


const getLeave = async (req, res) => {
    try {
        const leaves = await Cache.get('leaves')
        if (leaves) {
            return res.status(200).json(leaves);
        }
        const leave = await Leave.find().sort({ _id: -1 });
        Cache.set('leaves', leave, catchTime)
        res.status(200).json({ leave })

    } catch (error) {
        console.log("error");
        res.status(500).json({ error: "Internal Server Error", message: error.message });

    }
};

const generateCode = function generateRandomCode(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomCode = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomCode += characters.charAt(randomIndex);
    }
    return randomCode;
}

const saveCode = async function (code) {
    const date = new Date();
    const time = date.toTimeString().split(' ')[0]; // Get the current time

    const newCode = new Code({
        date,
        time,
        code
    });

    try {
        await newCode.save();
        console.log(`Saved new code: ${code} at time: ${time}`);
    } catch (err) {
        console.error(err);
    }
}

const getQRCode = async function (req, res) {
    const { date, time } = req.query;

    try {
        const code = await Code.findOne({ date, time });
        if (!code) {
            return res.status(404).json({ error: 'Code not found' });
        }

        const qrCode = await QRCode.toDataURL(code.code);
        res.json({ qrCode });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


const addwhatsApp = async (req, res) => {
    try {
        const { name, link } = req.body;

        // Validate if name and link are provided
        if (!name || !link) {
            return res.status(400).json({ error: "Name and link are required fields" });
        }

        // Save the group details to the database
        const newGroup = await whatsapp.find({ link })

        res.status(201).json({ message: 'WhatsApp group created successfully', group: newGroup });
    } catch (error) {
        console.log('error');
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

const getWhatsapp = async (req, res) => {
    try {
        const groupId = req.params.groupId;

        // Fetch the group details from the database
        const group = await whatsapp.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json({ group });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });

    }
};

const deleteWhatsApp = async (req, res) => {
    try {
        const { id } = req.params;
        const whatsAppPublic = await whatsapp.findById(id);
        if (!whatsAppPublic) {
            return res.status(404).json({ message: "Whatsapp group not found" });
        }
        await whatsapp.deleteOne({ _id: id });
        res.status(200).json({ message: "Whatsapp deleted successfully" });
    } catch {
        console.error("Error deleting :", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// add social-media
const addSocialMediaLinks = async(req,res)=>{
    const {website,instagram,facebook,whatsapp,youtube,email,location} = req.body;
    try {  
        const socialMedialinks = await socialMedia.create({
            website,
            instagram,
            facebook,
            whatsapp,
            youtube,
            email,
            location
        })
        res.status(200).json({socialMedialinks})   
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}

// get social-media
const getSocialMediaLinks = async(req,res) =>{
    try {
        const socialMedialinks = await socialMedia.find()
        if(socialMedialinks){
            res.status(200).json(socialMedialinks)
        }else{
            res.status(400).json({error:"Social media Links not found!!!"})
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}

// get social media link by id
const getSocialMediaById = async(req,res) =>{
    const {id} = req.params
    try {
        const data = await socialMedia.findOne({_id:id})
        if(data){
            return res.status(200).json(data)
        }else{
            res.status(401).json("Result no found")
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });

    }
}


// update social media 
const updateSocialMediaLinks = async(req,res) =>{
    const {id} = req.params
    const {website,instagram,facebook,whatsapp,youtube,email,location} = req.body
    try {
        const updatedLinks = await socialMedia.findByIdAndUpdate({_id:id},
            {website,instagram,facebook,whatsapp,youtube,email,location},{new:true})
            await updatedLinks.save()
            res.status(200).json(updatedLinks)
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}


// add documents to the corresponding crm

const addDocumentsToCrm = async(req,res) =>{
    const {name} = re.body
    const {offerLetter} = req.file
}

module.exports = {
    // register,
    adminLogin,
    Protected,
    addCarousel,
    getCarousel,
    deleteCarousel,
    updateCarousel,
    addCalenderEvents,
    addCrm,
    deleteCalenderEvents,
    getCrmById,
    getCarouselById,
    getCrm,
    updateCrm,
    addAssignments,
    getLeave,
    getCalenderEvents,
    getCalenderEventsById,
    deleteCrm,
    // addleadsByExcelUpload,
    // deleteallleads,
    getLeads,
    // deleteLeads,
    generateCode,
    saveCode,
    getQRCode,
    addwhatsApp,
    getWhatsapp,
    deleteWhatsApp,
    getleadstotalcount,
    addSocialMediaLinks,
    getSocialMediaLinks,
    getSocialMediaById,
    updateSocialMediaLinks,
    getAllAssignments,
    getEachCrmAssignments,
    getEachAssignments
}
