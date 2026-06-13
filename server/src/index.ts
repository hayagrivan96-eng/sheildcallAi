import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { corsMiddleware, helmetMiddleware, sanitizeInput } from './middleware/security';
import apiRouter from './routes/api';
import { setupSocketIO } from './socket';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io with proper CORS config matching our client origin
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Configure Global Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply basic input sanitization to all incoming requests
app.use(sanitizeInput);

// Map API Routes
app.use('/api', apiRouter);

// Basic server home route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'ShieldCall AI Security Server',
    version: '1.0.0',
    description: 'Real-Time Scam Detection & Threat Intelligence Platform API',
    status: 'ONLINE'
  });
});

// Fallback error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'An unexpected internal error occurred on the security gateway.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Configure Socket.io Events
setupSocketIO(io);

// Determine listening port
const PORT = parseInt(process.env.PORT || '5000', 10);

httpServer.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🛡️  SHIELDCALL AI BACKEND ACTIVE ON PORT ${PORT}  🛡️`);
  console.log(`🚀 Security rules and rate limit limits loaded successfully.`);
  console.log(`📡 WebSocket socket.io engine active for simulations.`);
  console.log(`========================================================`);
});

// Handle graceful termination
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP and WebSocket servers closed. Exiting process.');
    process.exit(0);
  });
});
