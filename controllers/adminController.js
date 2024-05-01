const Admin = require('../models/adminModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Carousel = require('../models/carousel')
const Cache = require('../middlewares/Cache');
// const catchTime = 400;
const fs = require('fs');
const path = require('path');
const Calender = require('../models/Calender');
const crms = require('../models/crmModel');
const assignment = require('../models/Assignments');
const Leave = require('../models/Leave');
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
        console.log(id)
        const deletedCarousel = await Carousel.findOneAndDelete(id);
        console.log(deletedCarousel);
        if (!deletedCarousel) {
            return res.status(404).json({ error: "Carousel not found" });
        }

        // Extract the filename from the full URL
        const imageUrl = deletedCarousel.image;
        const filename = imageUrl.split('/').pop(); // Get the last part (filename)

        // Construct the path to the image file
        const imagePath = path.join( 'carousel', filename);

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
        const oldImagePath = path.join( 'carousel', filename);

        // Check if the old image file exists before trying to delete it
        if (fs.existsSync(oldImagePath)) {
            // Delete the old image file
            fs.unlinkSync(oldImagePath);
        }

        // Update the carousel item
        if(title){
            carouselItem.title = title;
        }
        if(description){
            carouselItem.description = description;
        }
        if(link){
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
        const cacheDate = await Calender.find().sort({ _id: -1 });
        Cache.set('calender', cacheDate, catchTime);
        res.status(200).json(calenderEvents);

    } catch (error) {
        console.log("error");
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
        const cacheDate = await Calender.find().sort({ _id: -1 });
        Cache.set('calender', cacheDate, catchTime);
        res.status(200).json({ message: "Calender deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const addCrm = async (req, res) => {
    try {
        const { name, email, password, phoneno,
            dateofBirth, program, guardian, joingdate, salary } = req.body;
        const imgObj = req.file;

        if (!imgObj || !imgObj.filename) {
            return res.status(400).json({ error: "Image is required" });
        }

        const crmDetails = await crms.create({
            name,
            email,
            password,
            phoneno,
            dateofBirth,
            program,
            guardian,
            joingdate,
            salary,
            image: `${process.env.DOMAIN}/public/crm/${imgObj.filename}`
        });
        
        const cacheDate = await crms.find().sort({ _id: -1 });
        Cache.set('crm', cacheDate, catchTime);
        res.status(200).json(crmDetails);
    } catch (error) {
        console.log("error");
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

const deletecrm = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCRM = await crms.findByIdAndDelete(id);
        if (!deletedCRM) {
            return res.status(404).json({ error: "Carousel not found" });
        }

        // Extract the filename from the full URL
        const imageUrl = deletedCRM.image;
        const filename = imageUrl.split('/').pop(); // Get the last part (filename)

        // Construct the path to the image file
        const imagePath = path.join('public', 'crm', filename);

        // Delete the image file
        fs.unlinkSync(imagePath);

        // Update the carousel cache
        const crmCache = await crms.find().sort({ _id: -1 });
        Cache.set('crm', crmCache, catchTime);

        res.status(200).json({ message: "CRM deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
};
const getCrm =async (req,res)=>{
    try {
        const crmCache = await Cache.get('crms')
        if (crmCache) {
            return res.status(200).json(crmCache);
        }
        const crm = await crms.find().sort({_id: -1});
        Cache.set('crms',crm,catchTime);
        res.status(200).json({crm});
    } catch (error) {
        console.log("error");
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

const updateCrm =async (req,res)=>{
    try {
        const {id}= req.params;
        const {phoneno,program,salary} = req.body;
        const imgObj =req.file;

        const updatedcrm = await crms.findByIdAndUpdate(id,{
            phoneno,
            program,
            salary,
            image:`${process.env.DOMAIN}/public/crm/${imgObj.filename}`
        });
        if (!updatedcrm) {
            return res.status(404).json({error: "CRM not found"})
        }

        const oldImageFilename = updatedcrm.image;
        const filename = oldImageFilename.split('/').pop();
        const oldImagePath = path.join('public', 'crm',filename);


        const newImageFilename = imgObj.filename;
        const newImagePath = path.join('public', 'crm', newImageFilename);

        fs.unlinkSync(oldImagePath);


        const crmCache = await crms.find().sort({_id: -1})
        Cache.set('crm', crmCache ,catchTime);

        res.status(200).json({ message: "CRM updated successfully" });


    } catch (error) {
        console.log("error");
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

const addAssignments = async (req, res) => {
    try {
        const { title, subject, assignmentType, issueDate, dueDate, priority,createdBy } = req.body;
        const assignments = await assignment.create({
            title,
            subject,
            assignmentType,
            issueDate,
            dueDate,
            priority,
            createdBy: req.admin.id
            
        });
        const cacheDate = await assignment.find().sort({ _id: -1 });
        Cache.set('assignment', cacheDate, catchTime);
        res.status(200).json({ assignments });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }   
};


const getLeave =async(req,res)=>{
    try {       
           const leaves  =  await Cache.get('leaves')
           if (leaves) {
            return res.status(200).json(leaves);
           }
           const leave =await Leave.find().sort({_id: -1});
           Cache.set('leaves',leave ,catchTime)
            res.status(200).json({leave})

    } catch (error) {
        console.log("error");
        res.status(500).json({ error: "Internal Server Error", message: error.message });

    }
};

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
    deletecrm,
    getCarouselById,
    getCrm,
    updateCrm,
    addAssignments,
    getLeave
}