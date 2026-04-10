const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    correct: { type: Number, required: true },
    total:   { type: Number, required: true },
    avgTime: { type: Number, required: true }, // seconds per question
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selected: Number, // index chosen by user (-1 = timed out)
        correct:  Boolean,
        timeTaken: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Score', scoreSchema);
