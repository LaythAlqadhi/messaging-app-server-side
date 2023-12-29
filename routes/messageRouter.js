const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

// POST request to create a message.
router.post('/message', messageController.message_post);

// DELETE request to delete a message.
router.delete('/message/:messageId', messageController.message_delete);

// PATCH request to edit a message.
router.patch('/message/:messageId', messageController.message_patch);

// GET request for list of all conversation messages.
router.get('/messages', messageController.messages_get);

module.exports = router;
