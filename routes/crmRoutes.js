const express = require('express')
const crmController = require('../controllers/crmController');
const crmAuth = require('../middlewares/crmAuth');

const router = express.Router()

router.post('/register',crmAuth,crmController.register);
router.post('/login',crmAuth,crmController.crmLogin);

router.get('/protected',crmAuth,crmController.protected);
router.get('/get-crm-data',crmAuth,crmController.getCRMDetails)

module.exports = router