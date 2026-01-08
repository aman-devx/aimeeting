var express = require('express');
var router = express.Router();
const {create, getById, getByEmail, login, verifyAccount, loginWithSocial, resetLink, updatePassword, verifyToken } = require('../controller/user/user');

router.post('/create', create);
router.post('/verifyaccount', verifyAccount);

router.post('/login', login);
router.post('/loginwithsocial', loginWithSocial);

router.get('/getbyid', getById);
router.get('/getbyemail', getByEmail);

router.post('/resetlink', resetLink);
router.post('/updatepassword', updatePassword);

router.post('/verifytoken', verifyToken);



module.exports = router;