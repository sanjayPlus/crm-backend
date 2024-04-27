const express = require('express')
const crmController = require('../controllers/crmController')

const router = express.Router()

// register
router.post('/register',crmController.register)

// login
router.post('/login',crmController.crmLogin)

module.exports = router