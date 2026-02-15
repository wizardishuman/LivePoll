// In-memory data store for testing
let polls = [];
let votes = [];

const { Poll } = require('./Poll');

// Mock Poll class for testing
class MockPoll {
  constructor(data) {
    this.pollId = data.pollId;
    this.question = data.question;
    this.options = data.options;
    this.createdAt = new Date();
    this.save = async () => {
      const existingIndex = polls.findIndex(p => p.pollId === this.pollId);
      if (existingIndex >= 0) {
        polls[existingIndex] = this;
      } else {
        polls.push(this);
      }
      return this;
    };
  }

  static async findOne(query) {
    if (query.pollId) {
      return polls.find(p => p.pollId === query.pollId) || null;
    }
    return null;
  }

  static async updateOne(query, update) {
    if (query.pollId && update.$inc && update.$inc['options.$.votes']) {
      const poll = polls.find(p => p.pollId === query.pollId);
      if (poll && query['options.optionIndex'] !== undefined) {
        poll.options[query['options.optionIndex']].votes += 1;
      }
    }
    return { modifiedCount: 1 };
  }
}

class MockVote {
  constructor(data) {
    this.pollId = data.pollId;
    this.optionIndex = data.optionIndex;
    this.ipAddress = data.ipAddress;
    this.fingerprint = data.fingerprint;
    this.votedAt = new Date();
    this.save = async () => {
      votes.push(this);
      return this;
    };
  }

  static async findOne(query) {
    if (query.pollId && query.ipAddress) {
      return votes.find(v => v.pollId === query.pollId && v.ipAddress === query.ipAddress) || null;
    }
    if (query.pollId && query.fingerprint) {
      return votes.find(v => v.pollId === query.pollId && v.fingerprint === query.fingerprint) || null;
    }
    return null;
  }
}

module.exports = { 
  Poll: MockPoll, 
  Vote: MockVote 
};
