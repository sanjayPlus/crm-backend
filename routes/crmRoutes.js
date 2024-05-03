const express = require('express')
const crmController = require('../controllers/crmController');
const crmAuth = require('../middlewares/crmAuth');
const multer = require('multer');

const router = express.Router();

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



module.exports = router