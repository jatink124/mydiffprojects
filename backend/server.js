const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes'); // Ensure this path is correct

const app = express();
const PORT = process.env.PORT || 5000; // Use process.env.PORT for deployment flexibility

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies
app.use('/api/tasks', taskRoutes); // Mount task routes

// MongoDB Connection
mongoose.connect('mongodb+srv://kaushaljatin48:iamjatin123@cluster0.bbczg.mongodb.net/test1?retryWrites=true&w=majority')
  .then(() => {
    console.log('MongoDB connected successfully!');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process if DB connection fails
  });