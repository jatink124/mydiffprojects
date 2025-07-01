const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['trading', 'webdev', 'personal'],
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Journal', JournalSchema);