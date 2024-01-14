const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  elements: { type: mongoose.Schema.Types.Mixed, default: [] },
  connectors: { type: mongoose.Schema.Types.Mixed, default: [] },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Board', BoardSchema);
