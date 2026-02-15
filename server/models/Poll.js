const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  pollId: {
    type: String,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const voteSchema = new mongoose.Schema({
  pollId: {
    type: String,
    required: true,
    ref: 'Poll'
  },
  optionIndex: {
    type: Number,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  fingerprint: {
    type: String,
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
});

voteSchema.index({ pollId: 1, ipAddress: 1 });
voteSchema.index({ pollId: 1, fingerprint: 1 });

const Poll = mongoose.model('Poll', pollSchema);
const Vote = mongoose.model('Vote', voteSchema);

module.exports = { Poll, Vote };
