require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const groupRoutes = require('./src/routes/groupRoutes');

const app = express();
// Parse PORT - K8s might set it to "tcp://IP:PORT" format
const parsePort = (portVal) => {
  if (!portVal) return 5003;
  if (typeof portVal === 'number') return portVal;
  const portStr = String(portVal);
  if (portStr.includes('://')) {
    const match = portStr.match(/:(\d+)$/);
    return match ? parseInt(match[1]) : 5003;
  }
  return parseInt(portStr) || 5003;
};
const PORT = parsePort(process.env.PORT);

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost',
      'http://localhost:80',
      process.env.CORS_ORIGIN
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'group-service' });
});

// API Routes
app.use('/api/groups', groupRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Group service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  process.exit(0);
});

module.exports = app;
