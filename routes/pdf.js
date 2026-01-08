



const express = require('express');
const router = express.Router();
const pdfController = require('../controller/pdf/pdf');

// Make sure to use the middleware BEFORE the controller
router.post('/lockpdf', pdfController.uploadMiddleware, pdfController.lockpdf);

module.exports = router;