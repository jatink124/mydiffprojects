require('dotenv').config(); // If you use dotenv for env vars in your backend
const axios = require('axios');

const testPrompt = async (promptText) => {
    const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if your backend is on Render or different port

    try {
        const res = await axios.post(`${API_BASE_URL}/gemini/gemini-analysis`, {
            prompt: promptText
        });
        console.log('Gemini Insight:', res.data);
    } catch (error) {
        console.error('Error fetching Gemini insight:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        console.error('Full Error:', error);
    }
};

// --- Test Basic Prompts ---
console.log('\n--- Testing: Simple Question ---');
testPrompt("What is the capital of France?");

console.log('\n--- Testing: Short Story Prompt ---');
testPrompt("Write a very short, humorous story about a cat who tries to learn to fly.");

console.log('\n--- Testing: Empty Prompt (should trigger 400) ---');
testPrompt(""); // This should return a 400 error from your backend

console.log('\n--- Testing: Long Prompt (optional, for stress testing) ---');
// testPrompt("Analyze the following complex data set for potential patterns and anomalies: [paste a very long text here]");