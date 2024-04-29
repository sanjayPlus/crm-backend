const Admin = require('../models/adminModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Carousel = require('../models/carousel')
const Cache = require('../middlewares/Cache');
const catchTime = 600;
const fs = require('fs');
const path = require('path');

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
        if(!email || !password) {
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
            image: `${process.env.DOMAIN}/public/carousel/${imgObj.filename}`
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



const deleteCarousel = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCarousel = await Carousel.findByIdAndDelete(id);
        if (!deletedCarousel) {
            return res.status(404).json({ error: "Carousel not found" });
        }

        // Extract the filename from the full URL
        const imageUrl = deletedCarousel.image;
        const filename = imageUrl.split('/').pop(); // Get the last part (filename)

        // Construct the path to the image file
        const imagePath = path.join('public', 'carousel', filename);

        // Delete the image file
        fs.unlinkSync(imagePath);

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

        const updatedCarousel = await Carousel.findByIdAndUpdate(id, {
            title,
            description,
            link,
            image: `${process.env.DOMAIN}/public/carousel/${imgObj.filename}`
        });
        if (!updatedCarousel) {
            return res.status(404).json({ error: "Carousel not found" });
        }

        
        // Construct the path to the old image file
        const oldImageFilename = updatedCarousel.image;
        const filename = oldImageFilename.split('/').pop(); // Get the last part (filename)
        const oldImagePath = path.join( 'public', 'carousel', filename);

        // Construct the path to the new image file
        const newImageFilename = imgObj.filename;
        const newImagePath = path.join( 'public', 'carousel', newImageFilename);

        // Delete the old image file
        fs.unlinkSync(oldImagePath);

        // Update the carousel cache
        const carouselCache = await Carousel.find().sort({ _id: -1 });
        Cache.set('carousel', carouselCache, catchTime);

        res.status(200).json({ message: "Carousel updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
        console.error(error);
    }
};

module.exports = {
    // register,
    adminLogin,
    addCarousel,
    getCarousel,
    deleteCarousel,
    updateCarousel,
}