const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const Journal = require('../models/Journal');

// Create a new entry
router.post('/', async (req, res) => {
  try {
    const { journalType, title, content, tags, tradeData, codeSnippet, reflection } = req.body;
    
    const entry = new Entry({
      journalType,
      title,
      content,
      tags,
      tradeData,
      codeSnippet,
      reflection
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all entries (with optional filtering by journal type)
router.get('/', async (req, res) => {
  try {
    const { journalType } = req.query;
    const query = journalType ? { journalType } : {};
    
    const entries = await Entry.find(query).sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an entry
router.patch('/:id', async (req, res) => {
  try {
    const entry = await Entry.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize journals (run once)
router.post('/init-journals', async (req, res) => {
  try {
    const journals = [
      { name: 'trading', description: 'Track your trades and analyze patterns' },
      { name: 'webdev', description: 'Document your coding journey' },
      { name: 'personal', description: 'Reflect on personal growth' }
    ];

    await Journal.deleteMany({});
    const createdJournals = await Journal.insertMany(journals);
    res.json(createdJournals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;