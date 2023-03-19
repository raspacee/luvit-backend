const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friend.controller');

// Route to query all friends
router.get('/', friendController.get);

module.exports = router;