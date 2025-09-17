const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // For development, we'll use a local MongoDB instance
    // In production, you would use your MongoDB Atlas URI or other MongoDB service
    const conn = await mongoose.connect('mongodb+srv://pranjalshukla245:npL6jd2nYv9foEYf@erp.sx10k.mongodb.net/reference_id?retryWrites=true&w=majority&appName=ERP', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;