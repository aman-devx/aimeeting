var express = require('express');
var router = express.Router();
const {create, getProcessed } = require('../controller/processed/processed');

router.post('/create', create);
router.get('/getprocessed', getProcessed);

module.exports = router;