// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== ROUTES ====================
app.use('/api/students', studentRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'LX Result System API',
    mongodb:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Serve frontend pages
const pages = [
  '/',
  '/check-result',
  '/add-student',
  '/update-student',
  '/view-students',
];
pages.forEach((page) => {
  const fileName = page === '/' ? 'index.html' : `${page.slice(1)}.html`;
  app.get(page, (req, res) =>
    res.sendFile(path.join(__dirname, 'public', fileName))
  );
});

// Catch-all 404 for APIs
app.use('/api/*', (req, res) =>
  res.status(404).json({ error: 'API endpoint not found' })
);
app.use((req, res) =>
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'))
);

// ==================== START SERVER ====================
const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`🚀 LX Result System running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

// ==================== GRACEFUL SHUTDOWN ====================
['SIGINT', 'SIGTERM'].forEach((signal) =>
  process.on(signal, async () => {
    console.log(`${signal} received. Closing MongoDB...`);
    await mongoose.connection.close();
    process.exit(0);
  })
);
