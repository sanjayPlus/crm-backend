const express = require('express');
const crmController = require('../controllers/crmController');
const crmAuth = require('../middlewares/crmAuth');
const multer = require('multer');
const router = express.Router();

// Define multer disk storage for file uploads
const excelStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the path of the directory where files will be stored
        cb(null, "./public/exceluploads");
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

// Configure multer upload middleware
const excelUpload = multer({
    storage: excelStorage,
    // Optionally, you can set limits for file size, if needed
    // limits: {
    //     fileSize: 20 * 1024 * 1024, // 20 MB
    // },
});


// Routes
router.post('/register', crmController.register);
router.post('/login', crmController.crmLogin);
router.post('/add-assignments', crmAuth, crmController.addAssignments);
router.post('/add-leave', crmAuth, crmController.addLeave);
router.get('/protected', crmAuth, crmController.protected);
router.get('/get-crm-data', crmAuth, crmController.getCRMDetails);



const userStorage = multer.diskStorage({
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
  const userImage = multer({
    storage: userStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });

router.post('/register',crmController.register);
router.post('/login',crmController.crmLogin);
router.post('/add-assignments',crmAuth,crmController.addAssignments);
router.post('/add-leave',crmAuth,crmController.addLeave);
router.post('/add-users',userImage.single('image'),crmController.addUsers);

router.get('/protected',crmAuth,crmController.protected);
router.get('/get-crm-data',crmAuth,crmController.getCRMDetails);
router.get('/get-users',crmAuth,crmController.getUsers);

router.delete('/delete-user/:id',crmController.deleteUser);

// Route for uploading Excel file
router.post('/upload-excel', excelUpload.single('file'),crmController.excelfileupload);

// Route for getting all leads
router.get('/get-leads',crmController.getleads);

// Route for getting leads by ID
router.get('/get-leadsby-id/:id',crmController.getleadsbyid);
module.exports = router;
