const express = require('express');
const router = express.Router();
const friendRequestController = require('../controllers/friendRequest.controller');

// Route to send a friend request
router.post('/', friendRequestController.post);

router.get('/', friendRequestController.get);

// Route to accept/reject a friend request
router.patch('/', friendRequestController.patch);

module.exports = router;