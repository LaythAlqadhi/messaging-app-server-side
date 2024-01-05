const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const authenticate = require('../auth/authenticate');
const User = require('../models/user');
const Message = require('../models/message');
const Chat = require('../models/chat');

exports.chats_get = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    const chats = await Chat.find({ users: req.user.id })
      .populate({
        path: 'users',
        select: 'fullName',
      })
      .populate({
        path: 'messages',
        select: 'content',
        options: { sort: { createdAt: -1 }, limit: 1 },
      })
      .exec();

    if (chats.length === 0) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ chats });
  }),
];
