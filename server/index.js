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
const seedAdminUser = require('./utils/seedData');

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

const connectWithFallback = async () => {
  if (MONGO_URI) {
    try {
      console.log('Attempting connection to MongoDB Atlas...');
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connected to MongoDB Atlas');
      await seedAdminUser();
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to MongoDB Atlas URI. Falling back to MongoMemoryServer...', err.message);
    }
  } else {
    console.log('No MONGO_URI provided. Starting in-memory MongoDB...');
  }

  try {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to In-Memory MongoDB Server:', mongoUri);
    await seedAdminUser();
  } catch (err) {
    console.error('❌ Failed to start In-Memory MongoDB:', err);
  }
};

connectWithFallback().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
