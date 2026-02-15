const { Poll } = require('../models/MockPoll');
const { v4: uuidv4 } = require('uuid');

const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ 
        error: 'Question and at least 2 options are required' 
      });
    }

    const cleanOptions = options.map(opt => opt.trim()).filter(opt => opt.length > 0);
    
    if (cleanOptions.length < 2) {
      return res.status(400).json({ 
        error: 'At least 2 valid options are required' 
      });
    }

    const pollId = uuidv4();
    
    const poll = new Poll({
      pollId,
      question: question.trim(),
      options: cleanOptions.map(text => ({ text, votes: 0 }))
    });

    await poll.save();

    res.status(201).json({
      pollId,
      shareLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/poll/${pollId}`
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
};

const getPoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findOne({ pollId });
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json({
      pollId: poll.pollId,
      question: poll.question,
      options: poll.options,
      createdAt: poll.createdAt
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
};

module.exports = { createPoll, getPoll };
