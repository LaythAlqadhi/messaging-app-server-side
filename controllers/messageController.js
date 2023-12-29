const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const authenticate = require('../auth/authenticate');
const Message = require('../models/message');

exports.messages_get = [
  authenticate,

  body('senderId').trim().notEmpty().escape(),
  body('receiverId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    if (req.body.senderId !== req.user.id) {
      res.sendStatus(403);
      return;
    }

    const messages = await Message.find({
      sender: req.body.senderId,
      receiver: req.body.receiverId,
    });

    if (messages.length <= 0) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({ messages });
  }),
];

exports.message_post = [
  authenticate,

  body('receiver').trim().notEmpty().escape(),
  body('content').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      sender: req.user.id,
      receiver: req.body.receiver,
      content: req.body.content,
    });

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    } else {
      await message.save();
      res.status(200).json({ message });
    }
  }),
];

exports.message_delete = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    const message = await Message.findById(req.params.messageId).populate(
      'sender',
    );

    if (!message) {
      res.sendStatus(404);
    } else if (message.sender.id !== req.user.id) {
      res.sendStatus(403);
    } else {
      await Message.deleteOne({ _id: req.params.messageId });
      res.sendStatus(200);
    }
  }),
];

exports.message_patch = [
  authenticate,

  body('content')
    .trim()
    .notEmpty()
    .escape()
    .custom(async (value, { req }) => {
      const message = await Message.findById(req.params.messageId);
      if (value === message.content) {
        throw new Error('Edited content must differ from the previous content');
      }
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    } else {
      const message = await Message.updateOne(
        { _id: req.params.messageId },
        { $set: { content: req.body.content } },
      );
      res.status(200).json({ message });
    }
  }),
];
