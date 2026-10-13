// server/index.js
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const config = require('./config');
const { initWebSocketServer } = require('./services/wsService');

// Route handlers
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const ticketRoutes = require('./routes/tickets');
const aiRoutes = require('./routes/ai');
const statsRoutes = require('./routes/stats');

const app = express();
const server = http.createServer(app);

// Initialize real-time WebSocket server
initWebSocketServer(server);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'BookLeaf Author Support & Communication Portal API',
    timestamp: new Date().toISOString(),
    ai_provider: config.AI_PROVIDER
  });
});

// Mount REST API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stats', statsRoutes);

// Serve frontend in production build if client/dist exists
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API endpoint '${req.originalUrl}' not found.` });
});

// SPA catch-all fallback for non-API requests
if (fs.existsSync(clientDistPath)) {
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// Global Error Handler (meaningful JSON errors, not generic 500 HTML)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal server error occurred.',
    code: err.code || 'INTERNAL_SERVER_ERROR'
  });
});

server.listen(config.PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 BookLeaf Support Portal Server running on http://localhost:${config.PORT}`);
  console.log(`📡 WebSocket Real-Time Gateway active on ws://localhost:${config.PORT}`);
  console.log(`🧠 AI Engine Provider: [${config.AI_PROVIDER}]`);
  console.log(`==================================================\n`);
});

module.exports = { app, server };
