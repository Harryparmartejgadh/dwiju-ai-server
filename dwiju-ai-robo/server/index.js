import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Import routes
import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';
import featuresRoutes from './routes/features.js';
import uploadRoutes from './routes/upload.js';
import visionRoutes from './routes/vision.js';
import adminRoutes from './routes/admin.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const rateLimiterInstance = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') / 1000,
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'self'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dwiju-ai-robo')
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch((error) => console.error('✗ MongoDB connection error:', error));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Apply rate limiting to API routes
app.use('/api', rateLimiter(rateLimiterInstance));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/features', featuresRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// WebSocket connection for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
  
  socket.on('chat-message', async (data) => {
    try {
      // Handle real-time chat messages
      const { message, userId, roomId } = data;
      // Process message and emit response
      io.to(roomId).emit('chat-response', {
        id: Date.now().toString(),
        message: message,
        sender: 'user',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to process message' });
    }
  });
  
  socket.on('voice-data', (audioData) => {
    // Handle voice input data
    socket.emit('voice-processed', { text: 'Voice processing not implemented yet' });
  });
  
  socket.on('video-frame', (frameData) => {
    // Handle video frame for real-time vision processing
    socket.emit('vision-result', { objects: [], text: '' });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Dwiju AI Robo Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Shutting down server...');
  httpServer.close(() => {
    mongoose.connection.close();
    console.log('✓ Server closed');
    process.exit(0);
  });
});

export default app;
