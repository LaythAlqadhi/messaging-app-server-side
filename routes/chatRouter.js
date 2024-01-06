const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// POST request to create a new message.
router.post('/chats/message', chatController.message_post);

// GET request to retrieve a specific chat.
router.get('/chats/:chatId', chatController.chat_get);

// GET request to create a new chat.
router.post('/chats', chatController.chat_post);

// GET request to retrieve a specific chat.
router.get('/chats', chatController.chats_get);

module.exports = router;
