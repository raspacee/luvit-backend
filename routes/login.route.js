const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login.controller')

router.post('/', loginController.post);

module.exports = router;