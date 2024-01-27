const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');

const authenticate = require('../auth/authenticate');
const Chat = require('../models/chat');
const User = require('../models/user');

exports.chat_post = [
  authenticate,

  body('username').isString().trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    } else if (req.body.username === req.user.username) {
      res.sendStatus(400);
      return;
    }

    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      res.sendStatus(404);
      return;
    }

    const chat = await Chat.findOne({
      users: { $all: [req.user.id, user.id] },
    });

    if (chat) {
      res.json({ errors: [{ msg: 'The chat room already exists.' }] });
      return;
    }

    const newChat = new Chat({
      users: [req.user.id, user.id],
      messages: [
        {
          user: req.user.id,
          content: `${req.user.profile.firstName} added ${user.profile.firstName} to this chat room.`,
        },
      ],
    });

    await newChat.save();
    res.status(200).json(newChat);
  }),
];

exports.chat_get = [
  authenticate,

  param('chatId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    }

    const chat = await Chat.findById(req.params.chatId, {
      users: 1,
      messages: { $slice: -100 },
    })
      .populate({
        path: 'messages.user',
        model: 'User',
        select: 'profile content',
      })
      .lean();

    if (!chat) {
      res.sendStatus(404);
      return;
    }
    if (!chat.users.map(String).includes(req.user.id.toString())) {
      res.sendStatus(403);
      return;
    }

    chat.messages.map(message => {
      message.id = message._id;
      message.user.id = message.user._id;
      
      message.isSender = message.user.id.toString() === req.user.id.toString();
    });

    res.status(200).json(chat);
  }),
];

exports.chats_get = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    const chats = await Chat.find({
      users: req.user.id,
    })
      .populate({
        path: 'users',
        select: 'profile',
      })
      .populate({
        path: 'messages.user',
        select: 'profile',
      })
      .sort('-messages.createdAt')
      .select({
        users: 1,
        messages: { $slice: -1 },
        createdAt: 1,
      })
      .exec();

    if (!chats) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json(chats);
  }),
];

exports.message_post = [
  authenticate,

  body('chatId').isString().trim().notEmpty().escape(),
  body('content').isString().trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    }

    const message = {
      user: req.user.id,
      content: req.body.content,
    };

    const chat = await Chat.updateOne(
      { _id: req.body.chatId, users: req.user.id },
      { $push: { messages: message } },
      { new: true },
    );

    if (!chat) {
      res.sendStatus(403);
      return;
    }

    res.status(200).json(chat);
  }),
];
