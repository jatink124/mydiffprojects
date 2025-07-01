const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  journalType: {
    type: String,
    required: true,
    enum: ['trading', 'webdev', 'personal'],
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Trading-specific fields
  tradeData: {
    asset: String,
    entryPrice: Number,
    exitPrice: Number,
    outcome: String,
    notes: String,
  },
  // Web Dev-specific fields
  codeSnippet: {
    language: String,
    code: String,
  },
  // Personal growth-specific fields
  reflection: {
    mood: String,
    achievements: [String],
    challenges: [String],
  },
});

module.exports = mongoose.model('Entry', EntrySchema);