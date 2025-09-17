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

// API endpoint to generate a reference ID (without saving to database)
// app.post('/api/generate-reference-id', async (req, res) => {
//   try {
//     // Generate a reference ID
//     const referenceId = generate19DigitReferenceId();
    
//     // Return the generated reference ID
//     res.json({ 
//       referenceId
//     });
//   } catch (error) {
//     console.error('Error generating reference ID:', error);
//     res.status(500).json({ error: 'Failed to generate reference ID' });
//   }
// });

// API endpoint to submit reference ID with date of birth (create new document)
app.post('/api/submit-reference-id', async (req, res) => {
  try {
    const { referenceId, dateOfBirth } = req.body;
    
    // Validate input
    if (!referenceId || !dateOfBirth) {
      return res.status(400).json({ error: 'Reference ID and Date of Birth are required' });
    }
    
    // Create a new document in the collection
    const newReferenceId = new ReferenceId({ 
      referenceId,
      dateOfBirth
    });
    await newReferenceId.save();
    
    // Return success response
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