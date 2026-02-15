const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fallback in-memory storage if MongoDB fails
let users = new Map();
let polls = new Map();
let votes = new Map();
let useMongoDB = false;

// Try MongoDB connection
let mongoose;
try {
  mongoose = require('mongoose');
  
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas');
      useMongoDB = true;
    })
    .catch((err) => {
      console.log('⚠️ MongoDB connection failed, using in-memory storage');
      console.log('❌ MongoDB Error:', err.message);
      useMongoDB = false;
    });
  } else {
    console.log('⚠️ No MongoDB URI provided, using in-memory storage');
    useMongoDB = false;
  }
} catch (err) {
  console.log('⚠️ Mongoose not installed, using in-memory storage');
  useMongoDB = false;
}

// Middleware
app.use(cors({
  origin: ["https://livepoll-4u85.onrender.com", "http://localhost:5000", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    let user;
    if (useMongoDB) {
      const User = mongoose.model('User');
      user = await User.findOne({ token });
    } else {
      user = Array.from(users.values()).find(u => u.token === token);
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: useMongoDB ? 'connected' : 'in-memory',
    pollsCount: polls.size,
    usersCount: users.size
  });
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    let existingUser;
    if (useMongoDB) {
      const User = mongoose.model('User');
      existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
    } else {
      existingUser = Array.from(users.values()).find(u => u.email === email || u.username === username);
    }
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const userId = Math.random().toString(36).substr(2, 9);
    const token = crypto.randomBytes(32).toString('hex');
    
    const user = {
      id: userId,
      username,
      email,
      password,
      token,
      createdAt: new Date().toISOString()
    };
    
    if (useMongoDB) {
      const User = mongoose.model('User');
      const mongoUser = new User({ ...user, _id: userId });
      await mongoUser.save();
    } else {
      users.set(userId, user);
    }
    
    console.log(`✅ User registered: ${username} (${useMongoDB ? 'MongoDB' : 'Memory'})`);
    
    res.json({
      user: { id: userId, username, email },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    let user;
    if (useMongoDB) {
      const User = mongoose.model('User');
      user = await User.findOne({ email, password });
    } else {
      user = Array.from(users.values()).find(u => u.email === email && u.password === password);
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log(`✅ User logged in: ${user.username} (${useMongoDB ? 'MongoDB' : 'Memory'})`);
    
    res.json({
      user: { id: user.id || user._id, username: user.username, email: user.email },
      token: user.token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Dashboard
app.get('/api/user/dashboard', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    let createdPolls = [];
    let userVotes = [];
    
    if (useMongoDB) {
      const Poll = mongoose.model('Poll');
      const Vote = mongoose.model('Vote');
      createdPolls = await Poll.find({ createdBy: userId });
      userVotes = await Vote.find({ userId });
    } else {
      createdPolls = Array.from(polls.values()).filter(poll => poll.createdBy === userId);
      userVotes = Array.from(votes.values()).filter(vote => vote.userId === userId);
    }
    
    res.json({
      createdPolls,
      votedPolls: [],
      totalVotes: userVotes.length
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Get poll
app.get('/api/polls/:pollId', async (req, res) => {
  try {
    const { pollId } = req.params;
    let poll;
    
    if (useMongoDB) {
      const Poll = mongoose.model('Poll');
      poll = await Poll.findOne({ pollId });
    } else {
      poll = polls.get(pollId);
    }
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    res.json(poll);
  } catch (error) {
    console.error('Get poll error:', error);
    res.status(500).json({ error: 'Failed to load poll' });
  }
});

// Create poll
app.post('/api/polls', authenticateUser, async (req, res) => {
  try {
    const { question, options } = req.body;
    
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: 'Question and at least 2 options required' });
    }
    
    const pollId = Math.random().toString(36).substr(2, 9);
    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/simple-vote.html#${pollId}`;
    const userId = req.user.id || req.user._id;
    
    const poll = {
      pollId,
      question,
      options: options.map(text => ({ text, votes: 0, voters: [] })),
      createdBy: userId,
      createdAt: new Date().toISOString()
    };
    
    if (useMongoDB) {
      const Poll = mongoose.model('Poll');
      const mongoPoll = new Poll(poll);
      await mongoPoll.save();
    } else {
      polls.set(pollId, poll);
    }
    
    console.log(`✅ Poll created: ${question} (${useMongoDB ? 'MongoDB' : 'Memory'})`);
    
    res.json({
      pollId,
      shareLink,
      question,
      options: poll.options
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Vote
app.post('/api/votes/:pollId', authenticateUser, async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user.id || req.user._id;
    
    let poll;
    if (useMongoDB) {
      const Poll = mongoose.model('Poll');
      poll = await Poll.findOne({ pollId });
    } else {
      poll = polls.get(pollId);
    }
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid option index' });
    }
    
    // Check if already voted
    const voteKey = `${userId}_${pollId}`;
    if (useMongoDB) {
      const Vote = mongoose.model('Vote');
      const existingVote = await Vote.findOne({ userId, pollId });
      if (existingVote) {
        return res.status(400).json({ error: 'You have already voted on this poll' });
      }
    } else {
      if (votes.has(voteKey)) {
        return res.status(400).json({ error: 'You have already voted on this poll' });
      }
    }
    
    // Record vote
    poll.options[optionIndex].votes += 1;
    poll.options[optionIndex].voters.push(userId);
    
    if (useMongoDB) {
      await poll.save();
      const Vote = mongoose.model('Vote');
      const vote = new Vote({ userId, pollId, optionIndex });
      await vote.save();
    } else {
      polls.set(pollId, poll);
      votes.set(voteKey, { userId, pollId, optionIndex, votedAt: new Date().toISOString() });
    }
    
    console.log(`✅ Vote recorded: ${userId} on ${pollId} (${useMongoDB ? 'MongoDB' : 'Memory'})`);
    
    res.json({
      success: true,
      options: poll.options
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// Serve static files
app.use(express.static(__dirname));

// Dashboard route redirect
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.listen(PORT, () => {
  console.log(`🚀 LivePoll server running on port ${PORT}`);
  console.log(`📊 Storage: ${useMongoDB ? 'MongoDB Atlas' : 'In-Memory'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: /api/auth/register, /api/auth/login`);
  console.log(`📝 Dashboard: /api/user/dashboard`);
  console.log(`📊 Create polls: http://localhost:${PORT}/api/polls`);
  console.log(`💾 MongoDB Status: ${useMongoDB ? 'Connected' : 'Fallback to Memory'}`);
});
