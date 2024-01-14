const router = require('express').Router();
const Board = require('../models/Board');

router.get('/:sessionId', async (req, res) => {
  try {
    const board = await Board.findOne({ sessionId: req.params.sessionId });
    res.json(board || { elements: [], connectors: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:sessionId', async (req, res) => {
  try {
    const { elements, connectors } = req.body;
    const board = await Board.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { elements, connectors, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:sessionId', async (req, res) => {
  try {
    await Board.findOneAndDelete({ sessionId: req.params.sessionId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
