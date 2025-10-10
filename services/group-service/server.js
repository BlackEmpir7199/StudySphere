require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { PrismaClient } = require('../../shared/node_modules/@prisma/client');
const { authenticate } = require('../../shared/utils/auth');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.GROUP_SERVICE_PORT || process.env.PORT || 5003;

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

// Get all groups (public)
app.get('/api/groups', authenticate, async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        channels: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to get groups' });
  }
});

// Get group by ID
app.get('/api/groups/:id', authenticate, async (req, res) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                interests: true,
              },
            },
          },
        },
        channels: {
          include: {
            _count: {
              select: {
                messages: true,
                events: true,
                resources: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ group });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to get group' });
  }
});

// Create new group
app.post('/api/groups', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Create group with default general channel
    const group = await prisma.group.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'admin',
          },
        },
        channels: {
          create: {
            name: 'general',
            type: 'text',
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        channels: true,
      },
    });

    res.status(201).json({
      message: 'Group created successfully',
      group,
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Update group
app.patch('/api/groups/:id', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if user is owner
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Only group owner can update group' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const updatedGroup = await prisma.group.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        channels: true,
      },
    });

    res.json({
      message: 'Group updated successfully',
      group: updatedGroup,
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete group
app.delete('/api/groups/:id', authenticate, async (req, res) => {
  try {
    // Check if user is owner
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Only group owner can delete group' });
    }

    await prisma.group.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Join group
app.post('/api/groups/:id/join', authenticate, async (req, res) => {
  try {
    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: req.params.id,
          userId: req.user.id,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json({ error: 'Already a member of this group' });
    }

    // Add user to group
    await prisma.groupMember.create({
      data: {
        groupId: req.params.id,
        userId: req.user.id,
        role: 'member',
      },
    });

    res.json({ message: 'Joined group successfully' });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave group
app.post('/api/groups/:id/leave', authenticate, async (req, res) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Owner cannot leave their own group
    if (group.ownerId === req.user.id) {
      return res.status(400).json({ error: 'Group owner cannot leave. Delete the group instead.' });
    }

    // Remove user from group
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: req.params.id,
          userId: req.user.id,
        },
      },
    });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Get group channels
app.get('/api/groups/:id/channels', authenticate, async (req, res) => {
  try {
    const channels = await prisma.channel.findMany({
      where: { groupId: req.params.id },
      include: {
        _count: {
          select: {
            messages: true,
            events: true,
            resources: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: 'Failed to get channels' });
  }
});

// Create channel in group
app.post('/api/groups/:id/channels', authenticate, async (req, res) => {
  try {
    const { name, type = 'text' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    // Check if user is admin or owner
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          where: { userId: req.user.id },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const member = group.members[0];
    if (!member || (member.role !== 'admin' && group.ownerId !== req.user.id)) {
      return res.status(403).json({ error: 'Only admins can create channels' });
    }

    const channel = await prisma.channel.create({
      data: {
        groupId: req.params.id,
        name,
        type,
      },
    });

    res.status(201).json({
      message: 'Channel created successfully',
      channel,
    });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

// Delete channel
app.delete('/api/channels/:id', authenticate, async (req, res) => {
  try {
    const channel = await prisma.channel.findUnique({
      where: { id: req.params.id },
      include: {
        group: true,
      },
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user is admin or owner
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: channel.groupId,
          userId: req.user.id,
        },
      },
    });

    if (!member || (member.role !== 'admin' && channel.group.ownerId !== req.user.id)) {
      return res.status(403).json({ error: 'Only admins can delete channels' });
    }

    await prisma.channel.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
});

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
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;

