var express = require('express');
var router = express.Router();
const {create, getContact } = require('../controller/contact/contact');

router.post('/create', create);
router.get('/getprocessed', getContact);

module.exports = router;