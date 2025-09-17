const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const ReferenceId = require('./models/ReferenceId');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: "*", // Vite's default port
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Function to generate a 19-digit reference ID
const generate19DigitReferenceId = () => {
  const min = 1000000000000000000n; // 10^18
  const max = 9999999999999999999n; // 10^19 - 1
  const range = max - min + 1n;
  const randomBigInt = BigInt(Math.floor(Math.random() * Number(range))) + min;
  return randomBigInt.toString();
};

// API endpoint to generate and save reference ID
app.post('/api/generate-reference-id', async (req, res) => {
  try {
    const { dateOfBirth } = req.body; // Extract date of birth from request body
    
    // Generate a unique reference ID
    let referenceId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Try to generate a unique ID (with a maximum of 10 attempts)
    while (!isUnique && attempts < maxAttempts) {
      referenceId = generate19DigitReferenceId();
      
      // Check if this ID already exists in the database
      const existing = await ReferenceId.findOne({ referenceId });
      
      if (!existing) {
        isUnique = true;
      }
      
      attempts++;
    }
    
    // If we couldn't generate a unique ID after maxAttempts, throw an error
    if (!isUnique) {
      throw new Error('Unable to generate a unique reference ID after maximum attempts');
    }
    
    // Save the reference ID and date of birth to the database
    const newReferenceId = new ReferenceId({ 
      referenceId,
      dateOfBirth // Include date of birth in the document
    });
    await newReferenceId.save();
    
    // Return the generated reference ID and date of birth
    res.json({ 
      referenceId,
      dateOfBirth
    });
  } catch (error) {
    console.error('Error generating reference ID:', error);
    res.status(500).json({ error: 'Failed to generate reference ID' });
  }
});

// API endpoint to submit reference ID with date of birth
app.post('/api/submit-reference-id', async (req, res) => {
  try {
    const { referenceId, dateOfBirth } = req.body;
    
    // Validate input
    if (!referenceId || !dateOfBirth) {
      return res.status(400).json({ error: 'Reference ID and Date of Birth are required' });
    }
    
    // Check if the reference ID exists in the database
    const existingReferenceId = await ReferenceId.findOne({ referenceId });
    
    if (!existingReferenceId) {
      return res.status(404).json({ error: 'Reference ID not found' });
    }
    
    // Update the reference ID record with submission info (if needed)
    // For now, we'll just return a success response
    res.json({ 
      message: 'Reference ID submitted successfully',
      referenceId,
      dateOfBirth
    });
  } catch (error) {
    console.error('Error submitting reference ID:', error);
    res.status(500).json({ error: 'Failed to submit reference ID' });
  }
});

// API endpoint to get all reference IDs (for debugging purposes)
app.get('/api/reference-ids', async (req, res) => {
  try {
    const referenceIds = await ReferenceId.find().sort({ createdAt: -1 }).limit(100);
    res.json(referenceIds);
  } catch (error) {
    console.error('Error fetching reference IDs:', error);
    res.status(500).json({ error: 'Failed to fetch reference IDs' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});