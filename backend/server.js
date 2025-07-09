require('dotenv').config(); // Ensure this is at the very top to load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // CORS middleware

const taskRoutes = require('./routes/taskRoutes');
// const geminiRoutes = require('./routes/geminiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI; // Use MONGODB_URI from .env

// --- Enhanced CORS Configuration for Express HTTP Routes ---
// This configuration allows specific origins to access your API
// and defines the allowed HTTP methods and headers.
app.use(cors({
  // Defines allowed origins for HTTP requests.
  // .filter(Boolean) removes any undefined/null entries (like if FRONTEND_URL is not set).
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', // Added from your example
    'https://webdevgurus.online', // Added from your example
    'https://mygrowthplanner.netlify.app', // Already present, but kept for clarity
    process.env.FRONTEND_URL // Dynamically add frontend URL from environment variables
  ].filter(Boolean),
  credentials: true, // Allow sending cookies, authorization headers, etc.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed request headers
}));

// Handle pre-flight OPTIONS requests for all routes
// This is crucial for complex CORS requests (e.g., non-simple methods, custom headers)
app.options('*', cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);
// app.use('/api/gemini', geminiRoutes);

// Simple root route to confirm server is running
app.get('/', (req, res) => {
  res.send('Task Management API server is running!');
});

// MongoDB Connection
if (!MONGODB_URI) {
  console.error('MongoDB URI is not defined in environment variables. Please set MONGODB_URI.');
  process.exit(1); // Exit process if critical environment variable is missing
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
    // Start the server only after successful database connection
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process on database connection failure
  });
