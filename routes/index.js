var express = require('express');
var router = express.Router();

const user = require('./user')
router.use('/user', user);

const processed = require('./processed')
router.use('/processed', processed);

const contact = require('./contact')
router.use('/contact', contact);


module.exports = router;