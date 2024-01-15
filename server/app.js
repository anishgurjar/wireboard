require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory fallback when MongoDB is unavailable
const memStore = new Map();
let mongoConnected = false;

if (process.env.NODE_ENV !== 'test') {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wireboard';
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
      mongoConnected = true;
    })
    .catch(() => {
      console.warn('MongoDB unavailable — using in-memory store (data resets on restart)');
    });
}

const getBoard = () => (mongoConnected ? require('./models/Board') : null);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', mongo: mongoConnected }));

app.get('/api/board/:sessionId', async (req, res) => {
  try {
    const Board = getBoard();
    if (Board) {
      const board = await Board.findOne({ sessionId: req.params.sessionId });
      return res.json(board || { elements: [], connectors: [] });
    }
    res.json(memStore.get(req.params.sessionId) || { elements: [], connectors: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/board/:sessionId', async (req, res) => {
  try {
    const { elements, connectors } = req.body;
    const Board = getBoard();
    if (Board) {
      const board = await Board.findOneAndUpdate(
        { sessionId: req.params.sessionId },
        { elements, connectors, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      return res.json(board);
    }
    const data = { elements, connectors, updatedAt: new Date() };
    memStore.set(req.params.sessionId, data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/board/:sessionId', async (req, res) => {
  try {
    const Board = getBoard();
    if (Board) {
      await Board.findOneAndDelete({ sessionId: req.params.sessionId });
    } else {
      memStore.delete(req.params.sessionId);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
