require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');
// const connectDB = require('./config/database');
const handleSocketConnection = require('./socket/socketHandler');

const pollRoutes = require('./routes/pollRoutes');
const voteRoutes = require('./routes/voteRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-memory user storage for authentication
const users = new Map();

app.use((req, res, next) => {
  req.io = io;
  next();
});

// connectDB(); // Commented out for testing

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

// Authentication endpoints
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
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
    
    users.set(userId, user);
    
    console.log(`✅ User registered: ${username}`);
    
    res.json({
      user: { id: userId, username, email },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = Array.from(users.values()).find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log(`✅ User logged in: ${user.username}`);
    
    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      token: user.token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Dashboard endpoint
app.get('/api/user/dashboard', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = Array.from(users.values()).find(u => u.token === token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({
      createdPolls: [],
      votedPolls: [],
      totalVotes: 0
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

app.use((req, res, next) => {
  const forwarded = req.headers['x-forwarded-for'];
  req.ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
  next();
});

app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

handleSocketConnection(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('MongoDB connection disabled for testing');
});
