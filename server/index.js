// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const visitRoutes = require('./routes/visitRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { seedDatabase } = require('./utils/seedData');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Visitor Pass Management API Server Running' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    if (MONGO_URI && MONGO_URI.trim() !== '') {
      console.log('Connecting to provided MongoDB Atlas URI...');
      try {
        await mongoose.connect(MONGO_URI, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connected to MongoDB Atlas successfully!');
      } catch (err) {
        console.warn('⚠️ Atlas connection failed (check Network Access IP Whitelist on Atlas):', err.message);
        console.log('Falling back to MongoDB In-Memory Server so application keeps running seamlessly...');
        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        console.log('✅ Connected to MongoDB In-Memory Server!');
      }
    } else {
      console.log('MONGO_URI not set. Launching MongoDB In-Memory Server...');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
      console.log('✅ Connected to MongoDB In-Memory Server!');
    }

    // Seed default demo data if empty
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
  }
};

startServer();
