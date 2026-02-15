require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');

const connectDB = require('./config/database');
const handleSocketConnection = require('./socket/socketHandler');

const pollRoutes = require('./routes/pollRoutes');
const voteRoutes = require('./routes/voteRoutes');

const app = express();
const server = http.createServer(app);

// ✅ Socket CORS
const io = socketIo(server, {
  cors: {
    origin: [
      "https://live-poll.vercel.app",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"]
  }
});

// ✅ Connect MongoDB
connectDB();

// In-memory user storage (temporary auth system)
const users = new Map();

// Attach io to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Proper CORS config
app.use(cors({
  origin: [
    "https://live-poll.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json());

/* ================= AUTH ================= */

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    const exists = Array.from(users.values()).find(u => u.email === email);
    if (exists)
      return res.status(400).json({ error: 'User exists' });

    const id = crypto.randomBytes(6).toString('hex');
    const token = crypto.randomBytes(32).toString('hex');

    const user = { id, username, email, password, token };
    users.set(id, user);

    res.json({
      user: { id, username, email },
      token
    });

  } catch (err) {
    res.status(500).json({ error: 'Register failed' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    const user = Array.from(users.values())
      .find(u => u.email === email && u.password === password);

    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      token: user.token
    });

  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Dashboard
app.get('/api/user/dashboard', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  const user = Array.from(users.values())
    .find(u => u.token === token);

  if (!user)
    return res.status(401).json({ error: 'Invalid token' });

  res.json({
    createdPolls: [],
    votedPolls: [],
    totalVotes: 0
  });
});

/* ================= ROUTES ================= */

app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);

/* ================= HEALTH ================= */

app.get('/health', (req, res) => {
  res.json({ status: "OK" });
});

/* ================= ERROR ================= */

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

/* ================= SOCKET ================= */

handleSocketConnection(io);

/* ================= START ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
