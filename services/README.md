# Services Architecture

This directory contains all microservices for the StudySphere application. The group-service has been restructured with proper MVC (Model-View-Controller) pattern.

## Folder Structure

### ✅ group-service (Restructured - MVC Pattern)

```
group-service/
├── src/
│   ├── controllers/
│   │   ├── groupController.js      # Group business logic
│   │   └── channelController.js    # Channel business logic
│   ├── routes/
│   │   └── groupRoutes.js          # API route definitions
│   └── middleware/                  # (Future: validation, rate limiting)
├── server.js                        # Entry point
└── package.json
```

**Benefits:**
- Separation of concerns
- Easier to test
- Better maintainability
- Clear responsibility for each file

### 🔄 Other Services (To be restructured)

The following services still need restructuring:
- `auth-service` - Currently all in server.js
- `user-service` - Currently all in server.js
- `chat-service` - Currently all in server.js

## API Changes

### Group Service - New Endpoints

**Before (Bug):**
- `GET /api/groups` → Returned ALL groups (confusing!)

**After (Fixed):**
- `GET /api/groups/my-groups` → Returns only groups the user is a member of
- `GET /api/groups/browse` → Returns all available groups (with `isMember` flag)
- `GET /api/groups/:id` → Get specific group details
- `POST /api/groups` → Create new group
- `POST /api/groups/:id/join` → Join a group
- `POST /api/groups/:id/leave` → Leave a group

## How to Add a New Endpoint

### Example: Add "Get Group Members" endpoint

1. **Add controller function** (`src/controllers/groupController.js`):
```javascript
exports.getGroupMembers = async (req, res) => {
  try {
    const members = await prisma.groupMember.findMany({
      where: { groupId: req.params.id },
      include: {
        user: {
          select: { id: true, email: true, interests: true },
        },
      },
    });
    res.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
};
```

2. **Add route** (`src/routes/groupRoutes.js`):
```javascript
router.get('/:id/members', authenticate, groupController.getGroupMembers);
```

3. **Use it in frontend** (`frontend/src/lib/api.js`):
```javascript
export const groupsAPI = {
  // ... existing methods
  getMembers: (id) => api.get(`/api/groups/${id}/members`),
};
```

## Testing Endpoints

### Using curl

**Get My Groups:**
```bash
curl http://localhost:5003/api/groups/my-groups \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

**Browse All Groups:**
```bash
curl http://localhost:5003/api/groups/browse \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

**Join a Group:**
```bash
curl -X POST http://localhost:5003/api/groups/GROUP_ID/join \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the collection from `docs/postman_collection.json` (if exists)
2. Or manually create requests
3. Make sure to include cookies in requests

## Development

### Running a Single Service

```bash
# From project root
cd services/group-service
npm run dev
```

### Adding Dependencies

```bash
cd services/group-service
npm install <package-name>
```

### Debugging

Add debug logs in controllers:
```javascript
console.log('User:', req.user);
console.log('Request body:', req.body);
```

## Next Steps

### TODO: Restructure Other Services

The same MVC pattern should be applied to:

**auth-service:**
```
auth-service/
├── src/
│   ├── controllers/
│   │   └── authController.js       # register, login, logout, me
│   ├── routes/
│   │   └── authRoutes.js
│   └── middleware/
│       └── validation.js            # Input validation
└── server.js
```

**user-service:**
```
user-service/
├── src/
│   ├── controllers/
│   │   ├── profileController.js    # getProfile, updateProfile
│   │   └── quizController.js       # submitQuiz, getSuggestions
│   ├── routes/
│   │   └── userRoutes.js
│   └── services/
│       └── genAIService.js          # Azure OpenAI integration
└── server.js
```

**chat-service:**
```
chat-service/
├── src/
│   ├── controllers/
│   │   ├── messageController.js    # getMessages
│   │   ├── eventController.js      # CRUD for events
│   │   └── resourceController.js   # CRUD for resources
│   ├── routes/
│   │   └── chatRoutes.js
│   ├── services/
│   │   ├── socketService.js        # Socket.io logic
│   │   └── genAIService.js         # Moderation, summarization
│   └── middleware/
│       └── upload.js                # File upload config
└── server.js
```

## Best Practices

1. **Keep controllers thin** - Business logic only, no database queries in routes
2. **Use services for complex logic** - E.g., AI integration, external APIs
3. **Validate input** - Add validation middleware before controllers
4. **Handle errors consistently** - Use try-catch in all async functions
5. **Log important actions** - Use morgan for HTTP logs, console for business logic
6. **Don't expose internal errors** - Return generic error messages to clients
7. **Use transactions for multiple DB operations** - Prisma transactions for data consistency

## Common Patterns

### Controller Pattern
```javascript
exports.actionName = async (req, res) => {
  try {
    // 1. Validate input
    if (!req.body.required) {
      return res.status(400).json({ error: 'Missing required field' });
    }

    // 2. Check permissions
    if (req.user.id !== resource.ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 3. Business logic
    const result = await prisma.model.operation({ ... });

    // 4. Return success
    res.json({ data: result });
  } catch (error) {
    console.error('Action error:', error);
    res.status(500).json({ error: 'Operation failed' });
  }
};
```

### Route Pattern
```javascript
const router = express.Router();
const { authenticate } = require('../../shared/utils/auth');
const controller = require('../controllers/controller');

router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, controller.create);
router.patch('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);

module.exports = router;
```

## Migration Guide

If you're updating from the old structure:

1. **Backup your code**
2. **Create new folder structure** as shown above
3. **Extract controller functions** from server.js
4. **Create route files** with Express Router
5. **Update server.js** to use routes
6. **Test all endpoints** to ensure nothing broke
7. **Update any documentation** referencing old paths

---

**Questions?** Check the main README.md or ask in the team chat!

