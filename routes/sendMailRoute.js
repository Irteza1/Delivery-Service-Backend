const express = require('express');
const router = express.Router();
const sendmail = require('../controller/sendMailController');

router.post('/', sendmail.sendmail);

module.exports = router;