const express = require('express')
const codeController = require('../controllers/codeController')
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router()


router.get('/get-qr', adminAuth, codeController.getQRCode);

module.exports = router