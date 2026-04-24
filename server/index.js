import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3005;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mugishaguevara12_db_user:Imanaihimbazwe@puzzle.lo5tknq.mongodb.net/';
const JWT_SECRET = process.env.JWT_SECRET || 'puzzle-game-secret';

// Mock Data Store (Fallback)
let isMockMode = false;
const mockUsers = [];
const mockScores = [];

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with Fallback Logic
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    isMockMode = false;
  })
  .catch(err => {
    console.warn('⚠️ MongoDB connection failed. Switching to MEMORY MODE (Mock).');
    console.warn('Reason:', err.message);
    isMockMode = true;
  });

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  progress_json: { type: String, default: '{}' }
});
const User = mongoose.model('User', userSchema);

const scoreSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  time: { type: Number, required: true },
  moves: { type: Number, required: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  date: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', scoreSchema);

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    
    if (isMockMode) {
      if (mockUsers.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      const newUser = { id: Date.now(), username, password_hash: hash };
      mockUsers.push(newUser);
      const token = jwt.sign({ id: newUser.id, username }, JWT_SECRET);
      return res.json({ token, username, message: 'Signed up in Memory Mode' });
    }

    const user = new User({ username, password_hash: hash });
    await user.save();
    const token = jwt.sign({ id: user._id, username }, JWT_SECRET);
    res.json({ token, username });
  } catch (err) { 
    console.error('Signup error:', err);
    if (err.code === 11000) res.status(400).json({ error: 'Username already taken' });
    else res.status(500).json({ error: 'Database error. Please try again later.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (isMockMode) {
      const user = mockUsers.find(u => u.username === username);
      if (!user || !await bcrypt.compare(password, user.password_hash)) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }
      const token = jwt.sign({ id: user.id, username }, JWT_SECRET);
      return res.json({ token, username, message: 'Logged in (Memory Mode)' });
    }

    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign({ id: user._id, username }, JWT_SECRET);
    res.json({ token, username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Database error. Please try again later.' });
  }
});

// Score Routes
app.post('/api/scores', async (req, res) => {
  try {
    if (isMockMode) {
      const newScore = { ...req.body, _id: Date.now(), date: new Date() };
      mockScores.push(newScore);
      return res.json({ success: true, score: newScore });
    }
    const score = new Score(req.body);
    await score.save();
    res.json({ success: true, score });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/scores', async (req, res) => {
  try {
    const { difficulty } = req.query;
    
    if (isMockMode) {
      const filtered = difficulty ? mockScores.filter(s => s.difficulty === difficulty) : mockScores;
      const sorted = filtered.sort((a, b) => a.time - b.time || a.moves - b.moves).slice(0, 10);
      return res.json(sorted);
    }

    const query = difficulty ? { difficulty } : {};
    const scores = await Score.find(query).sort({ time: 1, moves: 1 }).limit(10);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send(`Puzzle API is running. Mode: ${isMockMode ? 'MEMORY' : 'DATABASE'}`));

// Socket.io Multiplayer Logic
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-room', ({ username }) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms.set(roomCode, {
      players: [{ id: socket.id, username, board: [], moves: 0, time: 0 }],
      status: 'waiting'
    });
    socket.join(roomCode);
    socket.emit('room-created', roomCode);
    console.log(`Room ${roomCode} created by ${username}`);
  });

  socket.on('join-room', ({ roomCode, username }) => {
    const room = rooms.get(roomCode);
    if (room && room.players.length < 2) {
      room.players.push({ id: socket.id, username, board: [], moves: 0, time: 0 });
      socket.join(roomCode);
      
      // Notify both players that game is starting
      room.status = 'playing';
      
      // Generate a shared solvable board for both players
      let seed = Array.from({ length: 9 }, (_, i) => (i + 1) % 9);
      let emptyIndex = seed.indexOf(0);
      for (let i = 0; i < 100; i++) {
        const neighbors = [];
        const row = Math.floor(emptyIndex / 3);
        const col = emptyIndex % 3;
        if (row > 0) neighbors.push(emptyIndex - 3);
        if (row < 2) neighbors.push(emptyIndex + 3);
        if (col > 0) neighbors.push(emptyIndex - 1);
        if (col < 2) neighbors.push(emptyIndex + 1);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        [seed[emptyIndex], seed[randomNeighbor]] = [seed[randomNeighbor], seed[emptyIndex]];
        emptyIndex = randomNeighbor;
      }

      io.to(roomCode).emit('game-start', {
        players: room.players,
        seed: seed
      });
      console.log(`${username} joined room ${roomCode}`);
    } else {
      socket.emit('error', 'Room full or not found');
    }
  });

  socket.on('move-tile', ({ roomCode, board, moves, time }) => {
    socket.to(roomCode).emit('opponent-moved', { board, moves, time });
  });

  socket.on('player-won', ({ roomCode, username, moves, time }) => {
    io.to(roomCode).emit('game-over', { winner: username, moves, time });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
