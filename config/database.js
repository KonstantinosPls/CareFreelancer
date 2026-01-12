const mongoose = require('mongoose');

//establishing connection to MongoDB database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // In production, exit if DB connection fails - app cannot function without it
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    // In development, warn but allow server to start for UI preview
    console.warn('WARNING: Server running without database connection!');
  }
};

//handling connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

module.exports = connectDB;
