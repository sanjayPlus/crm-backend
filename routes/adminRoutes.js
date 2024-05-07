const express = require('express')
const adminController = require('../controllers/adminController')
const multer = require('multer');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router()

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

  //crm image
const crmStorage = multer.diskStorage({
  destination: function (req, file, cb) {
      // Specify the path of the directory where files will be stored
      cb(null, "./public/crm");
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
const crmImage = multer({
  storage: crmStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
});




// router.post('/register',adminController.register)
router.post('/login',adminController.adminLogin);
router.post('/addCarousel', carouselImage.single('image'),adminAuth,adminController.addCarousel);
router.post('/add-calender-events',adminAuth,adminController.addCalenderEvents);
router.post('/add-crms',adminAuth,adminController.addCrm);
router.post('/add-leads',upload.single('excel'),adminAuth,adminController.addleadsByExcelUpload);
router.post('/save-code',adminController.saveCode);
router.post('/whatsapp-group',adminController.addwhatsApp);



router.get('/protected',adminAuth,adminController.Protected);
router.get('/getCarousel',adminController.getCarousel);
router.get('/get-carousel-by-id/:id',adminController.getCarouselById);
router.get('/get-crms',adminController.getCrm);
router.get('/get-crms-by-id/:id',adminController.getCrmById);
router.get('/get-leaves',adminController.getLeave);
router.get('/get-calender',adminController.getCalenderEvents);
router.get('/get-calender-by-id/:id',adminController.getCalenderEventsById);
router.get('/get-all-leads',adminController.getLeads);
router.get('/get-qr', adminAuth, adminController.getQRCode);
router.get('/whatsapp',adminAuth,adminController.getWhatsapp);



router.delete('/deleteCarousel/:id',adminAuth,adminController.deleteCarousel);
router.delete('/delete-calender-events/:id',adminAuth,adminController.deleteCalenderEvents);
router.delete('/delete-crms/:id',adminAuth,adminController.deleteCrm);
router.delete('/delete-all-leads',adminAuth,adminController.deleteallleads);
router.delete('/delete-leads/:id',adminAuth,adminController.deleteLeads);
router.delete('/delete-whatsapp/:id',adminAuth,adminController.deleteWhatsApp);


router.put('/updateCarousel/:id', carouselImage.single('image'),adminAuth,adminController.updateCarousel);
router.put('/updateCrm/:id',adminAuth, adminController.updateCrm);



module.exports = router