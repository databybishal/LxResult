const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== ROUTES ====================
app.use('/api/students', studentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'LX Result System API',
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API docs
app.get('/api', (req, res) => {
  res.json({
    name: 'LX Result System API',
    version: '1.0.0',
    endpoints: {
      students: '/api/students',
      health: '/api/health',
    },
  });
});

// ==================== FRONTEND PAGES ====================
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

app.get('/check-result', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'check-result.html'))
);

app.get('/add-student', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'add-student.html'))
);

app.get('/update-student', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'update-student.html'))
);

app.get('/view-students', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'view-students.html'))
);

// ==================== ERROR HANDLING ====================
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// ==================== START SERVER AFTER DB CONNECT ====================
const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('✅ MongoDB connected');
    console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    app.listen(PORT, () => {
      console.log(`
🚀 LX Result System Started
===========================================
📍 Port: ${PORT}
⚙️  Environment: ${process.env.NODE_ENV || 'development'}
📅 Started: ${new Date().toLocaleString()}
===========================================
      `);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

// ==================== GRACEFUL SHUTDOWN ====================
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing MongoDB...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing MongoDB...');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
