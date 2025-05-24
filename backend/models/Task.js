const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    // UPDATE THIS ENUM ARRAY
    enum: ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low', 'P5 - Very Low'],
    default: 'P3 - Medium' // Also update the default value
  },
  completed: {
    type: Boolean,
    default: false
  },
  // New field for category
  category: {
    type: String,
    // Ensure this enum also matches your frontend categories if you updated them
    enum: ['General', 'Web Development', 'Trading', 'Personal', 'Work', 'Study', 'Health'],
    default: 'General'
  },
  // New field for Eisenhower Quadrant (add this if you haven't already in your schema)
  eisenhowerQuadrant: {
    type: String,
    enum: ['Urgent/Important', 'Important/Not Urgent', 'Urgent/Not Important', 'Not Urgent/Not Important'],
    default: 'Important/Not Urgent'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);