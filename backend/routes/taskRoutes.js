const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// Get all tasks, with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category } = req.query; // Get category from query parameters
    let query = {};
    if (category && category !== 'all') { // If category is provided and not 'all'
      query.category = category;
    }
    const tasks = await Task.find(query).sort({ createdAt: -1 }); // Sort by creation date by default
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Add a new task
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(400).json({ message: 'Error adding task', error: error.message });
  }
});

// Update an existing task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: 'Error updating task', error: error.message });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(204).send(); // No content to send back on successful delete
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router;