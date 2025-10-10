require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { PrismaClient } = require('../../shared/node_modules/@prisma/client');
const { authenticate } = require('../../shared/utils/auth');
const { classifyQuizAnswers, generateStudySuggestions } = require('../../shared/utils/azure');

const app = express();
const prisma = new PrismaClient();
// Parse PORT - K8s might set it to "tcp://IP:PORT" format
const parsePort = (portVal) => {
  if (!portVal) return 5002;
  if (typeof portVal === 'number') return portVal;
  const portStr = String(portVal);
  if (portStr.includes('://')) {
    const match = portStr.match(/:(\d+)$/);
    return match ? parseInt(match[1]) : 5002;
  }
  return parseInt(portStr) || 5002;
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
  res.json({ status: 'ok', service: 'user-service' });
});

// Get user profile
app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        interests: true,
        createdAt: true,
        updatedAt: true,
        ownedGroups: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        memberships: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Submit profile quiz (GenAI Use Case #1: Quiz Classification)
app.post('/api/profile/quiz', authenticate, async (req, res) => {
  try {
    const { answers } = req.body;

    // Validation
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Quiz answers are required' });
    }

    console.log('Processing quiz for user:', req.user.id);
    console.log('Answers:', answers);

    // Use Azure OpenAI to classify answers into interests
    const interests = await classifyQuizAnswers(answers);

    console.log('Classified interests:', interests);

    // Update user profile with interests
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        interests: interests,
      },
      select: {
        id: true,
        email: true,
        name: true,
        interests: true,
      },
    });

    res.json({
      message: 'Quiz submitted successfully',
      user: updatedUser,
      interests,
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: 'Failed to process quiz' });
  }
});

// Get study suggestions based on interests
app.get('/api/profile/suggestions', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        interests: true,
      },
    });

    if (!user || !user.interests || user.interests.length === 0) {
      return res.json({
        suggestions: ['Complete your profile quiz to get personalized suggestions'],
      });
    }

    // Generate study group suggestions using GenAI
    const suggestions = await generateStudySuggestions(user.interests);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Update user profile
app.patch('/api/profile', authenticate, async (req, res) => {
  try {
    const { interests, name } = req.body;

    const updateData = {};
    if (interests !== undefined) {
      updateData.interests = interests;
    }
    if (name !== undefined) {
      updateData.name = name;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        interests: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user by ID (for other services)
app.get('/api/users/:id', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        interests: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Search users by email or interests
app.get('/api/users/search', authenticate, async (req, res) => {
  try {
    const { q, interest } = req.query;

    const where = {};
    
    if (q) {
      where.email = {
        contains: q,
        mode: 'insensitive',
      };
    }

    // Note: Searching JSON arrays in Prisma is limited, this is a basic implementation
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        interests: true,
      },
      take: 20,
    });

    // Filter by interest if provided
    let filteredUsers = users;
    if (interest) {
      filteredUsers = users.filter(user => 
        user.interests.some(i => 
          typeof i === 'string' && i.toLowerCase().includes(interest.toLowerCase())
        )
      );
    }

    res.json({ users: filteredUsers });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;

