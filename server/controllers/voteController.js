const { Poll, Vote } = require('../models/MockPoll');

const vote = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;
    
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const fingerprint = req.headers['x-fingerprint'];

    if (!fingerprint) {
      return res.status(400).json({ error: 'Browser fingerprint required' });
    }

    if (typeof optionIndex !== 'number' || optionIndex < 0) {
      return res.status(400).json({ error: 'Invalid option index' });
    }

    const poll = await Poll.findOne({ pollId });
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid option index' });
    }

    const existingVoteByIP = await Vote.findOne({ pollId, ipAddress });
    if (existingVoteByIP) {
      return res.status(403).json({ error: 'You have already voted from this IP address' });
    }

    const existingVoteByFingerprint = await Vote.findOne({ pollId, fingerprint });
    if (existingVoteByFingerprint) {
      return res.status(403).json({ error: 'You have already voted from this browser' });
    }

    const vote = new Vote({
      pollId,
      optionIndex,
      ipAddress,
      fingerprint
    });

    await vote.save();

    await Poll.updateOne(
      { pollId, 'options.optionIndex': optionIndex },
      { $inc: { 'options.$.votes': 1 } }
    );

    const updatedPoll = await Poll.findOne({ pollId });

    req.io.to(pollId).emit('voteUpdate', {
      pollId,
      options: updatedPoll.options
    });

    res.json({
      success: true,
      options: updatedPoll.options
    });

  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
};

module.exports = { vote };
