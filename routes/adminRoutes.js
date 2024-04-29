const express = require('express')
const adminController = require('../controllers/adminController')
const multer = require('multer');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router()

//carousel image
const carouselStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the path of the directory where files will be stored
        cb(null, "./public/carousel");
    },
    filename: function (req, file, cb) {
        // Generate a unique filename with the original file extension
        const uniqueSuffix = Date.now();
        const fileExtension = file.originalname.split(".").pop(); // Get the file extension
        const newFilename = `${uniqueSuffix}.${fileExtension}`;
        cb(null, newFilename);
        console.log(newFilename);
    },
});
  
  // Configure storage engine instead of dest object.
  const carouselImage = multer({
    storage: carouselStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });


// router.post('/register',adminController.register)
router.post('/login',adminController.adminLogin);
router.post('/addCarousel', carouselImage.single('image'),adminAuth,adminController.addCarousel)

router.get('/getCarousel',adminController.getCarousel)

router.delete('/deleteCarousel/:id',adminAuth,adminController.deleteCarousel)

router.put('/updateCarousel/:id', carouselImage.single('image'),adminAuth,adminController.updateCarousel)


module.exports = router