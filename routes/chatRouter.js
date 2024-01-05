const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// GET request to retrieve list of all chats.
router.get('/chats', messageController.chats_get);

module.exports = router;
