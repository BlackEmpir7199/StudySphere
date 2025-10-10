require('dotenv').config({ path: '../../.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('../../shared/node_modules/@prisma/client');
const { authenticate, verifyToken } = require('../../shared/utils/auth');
const { moderateContent, summarizeResource } = require('../../shared/utils/azure');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();
const PORT = process.env.CHAT_SERVICE_PORT || process.env.PORT || 5004;

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost', 'http://localhost:80'],
    credentials: true,
  },
});

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

// File upload configuration
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chat-service' });
});

// Get messages for a channel
app.get('/api/channels/:channelId/messages', authenticate, async (req, res) => {
  try {
    const { limit = 50, before } = req.query;

    const where = {
      channelId: req.params.channelId,
    };

    if (before) {
      where.timestamp = {
        lt: new Date(before),
      };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: parseInt(limit),
    });

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Get events for a channel
app.get('/api/channels/:channelId/events', authenticate, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { channelId: req.params.channelId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Create event
app.post('/api/channels/:channelId/events', authenticate, async (req, res) => {
  try {
    const { title, description, gmeetLink, scheduledDate } = req.body;

    if (!title || !scheduledDate) {
      return res.status(400).json({ error: 'Title and scheduled date are required' });
    }

    const event = await prisma.event.create({
      data: {
        channelId: req.params.channelId,
        title,
        description,
        gmeetLink,
        scheduledDate: new Date(scheduledDate),
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Emit event to channel room
    io.to(`channel:${req.params.channelId}`).emit('event:created', event);

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
app.patch('/api/events/:id', authenticate, async (req, res) => {
  try {
    const { title, description, gmeetLink, scheduledDate } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Only event creator can update event' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (gmeetLink !== undefined) updateData.gmeetLink = gmeetLink;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);

    const updatedEvent = await prisma.event.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    io.to(`channel:${event.channelId}`).emit('event:updated', updatedEvent);

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
app.delete('/api/events/:id', authenticate, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Only event creator can delete event' });
    }

    await prisma.event.delete({
      where: { id: req.params.id },
    });

    io.to(`channel:${event.channelId}`).emit('event:deleted', { id: req.params.id });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get resources for a channel
app.get('/api/channels/:channelId/resources', authenticate, async (req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { channelId: req.params.channelId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    res.json({ resources });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to get resources' });
  }
});

// Upload resource (GenAI Use Case #2: Content Moderation)
app.post('/api/channels/:channelId/resources', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { title, url } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Resource title is required' });
    }

    // Moderate the title and URL
    const titleModeration = await moderateContent(title);
    const urlModeration = url ? await moderateContent(url) : { isClean: true };

    if (!titleModeration.isClean || !urlModeration.isClean) {
      return res.status(400).json({
        error: 'Resource contains inappropriate content',
        reason: titleModeration.reason || urlModeration.reason,
      });
    }

    const resourceData = {
      channelId: req.params.channelId,
      title,
      url: url || (req.file ? `/uploads/${req.file.filename}` : null),
      fileType: req.file ? req.file.mimetype : null,
      uploadedById: req.user.id,
    };

    const resource = await prisma.resource.create({
      data: resourceData,
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    io.to(`channel:${req.params.channelId}`).emit('resource:created', resource);

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource,
    });
  } catch (error) {
    console.error('Upload resource error:', error);
    res.status(500).json({ error: 'Failed to upload resource' });
  }
});

// Summarize resource (GenAI Use Case #3: Resource Summarization)
app.post('/api/resources/:id/summarize', authenticate, async (req, res) => {
  try {
    const { content } = req.body;

    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content is required for summarization' });
    }

    // Use Azure OpenAI to summarize the resource
    const summary = await summarizeResource(resource.title, content);

    // Update resource with summary
    const updatedResource = await prisma.resource.update({
      where: { id: req.params.id },
      data: { summary },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    io.to(`channel:${resource.channelId}`).emit('resource:updated', updatedResource);

    res.json({
      message: 'Resource summarized successfully',
      resource: updatedResource,
      summary,
    });
  } catch (error) {
    console.error('Summarize resource error:', error);
    res.status(500).json({ error: 'Failed to summarize resource' });
  }
});

// Delete resource
app.delete('/api/resources/:id', authenticate, async (req, res) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (resource.uploadedById !== req.user.id) {
      return res.status(403).json({ error: 'Only uploader can delete resource' });
    }

    await prisma.resource.delete({
      where: { id: req.params.id },
    });

    io.to(`channel:${resource.channelId}`).emit('resource:deleted', { id: req.params.id });

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    // Get token from cookies (sent automatically by browser)
    const cookies = socket.handshake.headers.cookie;
    
    if (!cookies) {
      return next(new Error('Authentication required'));
    }
    
    // Parse cookies
    const token = cookies
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = verifyToken(token);
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Invalid token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userEmail} (${socket.userId})`);

  // Join a channel room
  socket.on('channel:join', (channelId) => {
    socket.join(`channel:${channelId}`);
    console.log(`${socket.userEmail} joined channel ${channelId}`);
  });

  // Leave a channel room
  socket.on('channel:leave', (channelId) => {
    socket.leave(`channel:${channelId}`);
    console.log(`${socket.userEmail} left channel ${channelId}`);
  });

  // Send message with moderation (GenAI Use Case #2: Content Moderation)
  socket.on('message:send', async (data) => {
    try {
      const { channelId, text } = data;

      if (!text || text.trim().length === 0) {
        return socket.emit('error', { message: 'Message text is required' });
      }

      // Moderate message content
      const moderation = await moderateContent(text);

      if (!moderation.isClean) {
        // Store moderated message
        const message = await prisma.message.create({
          data: {
            channelId,
            userId: socket.userId,
            text: '[Message removed by content moderation]',
            isModerated: true,
            moderatedReason: moderation.reason,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        });

        // Notify user that their message was moderated
        socket.emit('message:moderated', {
          reason: moderation.reason,
          originalText: text.substring(0, 50) + '...',
        });

        return;
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          channelId,
          userId: socket.userId,
          text,
          isModerated: false,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      // Broadcast message to channel
      io.to(`channel:${channelId}`).emit('message:received', message);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing:start', (channelId) => {
    socket.to(`channel:${channelId}`).emit('typing:user', {
      userId: socket.userId,
      email: socket.userEmail,
    });
  });

  socket.on('typing:stop', (channelId) => {
    socket.to(`channel:${channelId}`).emit('typing:stop', {
      userId: socket.userId,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userEmail}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  io.close();
  process.exit(0);
});

module.exports = { app, server, io };

