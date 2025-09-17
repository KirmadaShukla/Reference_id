const mongoose = require('mongoose');

const referenceIdSchema = new mongoose.Schema({
  referenceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
referenceIdSchema.index({ referenceId: 1 });
referenceIdSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ReferenceId', referenceIdSchema);