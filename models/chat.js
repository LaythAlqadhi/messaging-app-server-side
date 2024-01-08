const mongoose = require('mongoose');

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'Success',
    },
  },
  { timestamps: true },
);

const chatSchema = new Schema(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    messages: [messageSchema],
  },
  { timestamps: true },
);

chatSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Chat', chatSchema);
