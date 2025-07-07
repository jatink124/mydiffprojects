// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const taskRoutes = require('./routes/taskRoutes');   // Your existing task routes
const geminiRoutes = require('./routes/geminiRoutes'); // Your new Gemini AI routes

const app = express();
const PORT = process.env.PORT || 5000; // Use port from environment variable or default to 5000
const MONGODB_URI = process.env.MONGODB_URI; // Get MongoDB URI from environment variables
// Replace the current app.use(cors()) with:
const corsOptions = {
  origin: ['http://localhost:3000', 'https://mydiffprojects.onrender.com','https://mygrowthplanner.netlify.app'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // if you need to send cookies
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
// --- Middleware ---
app.use(cors()); // Enable CORS for all routes (important for frontend communication)
app.use(express.json()); // Parse JSON bodies of incoming requests

// --- Routes ---
// Mount your task-related API routes
app.use('/api/tasks', taskRoutes);

// Mount your Gemini AI-related API routes
// All requests to /api/gemini will be handled by geminiRoutes
app.use('/api/gemini', geminiRoutes);

// Simple root route to confirm server is running
app.get('/', (req, res) => {
    res.send('Task Management API server is running!');
});

// --- MongoDB Connection ---
if (!MONGODB_URI) {
    console.error('MongoDB URI is not defined in environment variables. Please set MONGODB_URI.');
    process.exit(1); // Exit if essential config is missing
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully!');
        // Start the server only after successful database connection
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process if DB connection fails
    });