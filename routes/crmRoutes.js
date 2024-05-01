const express = require('express')
const crmController = require('../controllers/crmController');
const crmAuth = require('../middlewares/crmAuth');
const multer = require('multer');

const router = express.Router()

router.post('/register',crmController.register);
router.post('/login',crmController.crmLogin);
router.post('/add-assignments',crmAuth,crmController.addAssignments);
router.post('/add-leave',crmAuth,crmController.addLeave);

router.get('/protected',crmAuth,crmController.protected);
router.get('/get-crm-data',crmAuth,crmController.getCRMDetails);



module.exports = router