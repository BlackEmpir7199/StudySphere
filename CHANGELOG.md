# Changelog

## [Unreleased] - 2024-01-XX

### 🐛 Fixed
- **Auto-join bug**: New users no longer automatically appear in all groups
  - Changed `GET /api/groups` to `GET /api/groups/my-groups` (returns only user's groups)
  - Added `GET /api/groups/browse` (returns all groups with `isMember` flag)
  
- **Browse Groups feature**: Users can now properly browse and join groups
  - Added "Browse Groups" button in sidebar
  - Shows all available groups with join/joined status
  - Join button only appears for groups user hasn't joined

### 🏗️ Restructured
- **group-service**: Refactored to MVC pattern
  - `src/controllers/groupController.js` - Group business logic
  - `src/controllers/channelController.js` - Channel business logic
  - `src/routes/groupRoutes.js` - Route definitions
  - `server.js` - Now clean entry point

### 📝 Documentation
- Added `services/README.md` - Guide for service structure and development
- Includes migration guide for restructuring other services

### 🔄 API Changes

**Group Service:**
```
OLD: GET /api/groups → All groups (bug)
NEW: GET /api/groups/my-groups → User's groups only
NEW: GET /api/groups/browse → All groups with isMember flag
```

### 🎯 Next Steps
- [ ] Restructure auth-service with MVC pattern
- [ ] Restructure user-service with MVC pattern
- [ ] Restructure chat-service with MVC pattern
- [ ] Add input validation middleware
- [ ] Add rate limiting
- [ ] Add request logging middleware

---

## How to Test

### 1. Stop Docker
```bash
docker-compose down
```

### 2. Rebuild Services
```bash
docker-compose up --build
```

### 3. Test Flow

**User A (Existing):**
1. Login
2. Create a group "CS Study Group"
3. Should see it in sidebar

**User B (New):**
1. Register new account
2. Login
3. Should see NO groups in sidebar (✅ Fixed!)
4. Click "Browse Groups"
5. Should see "CS Study Group"
6. Click "Join Group"
7. Now sees group in sidebar

### 4. Verify

Check browser console:
- ✅ Socket connected
- ❌ No CORS errors
- ❌ No 404 errors

---

## Breaking Changes

### Frontend API
If you have custom frontend code using `groupsAPI.getAll()`, update to:
```javascript
// Before
const response = await groupsAPI.getAll();

// After (for user's groups)
const response = await groupsAPI.getMyGroups();

// Or (for browsing all groups)
const response = await groupsAPI.browseGroups();
```

### Backend Routes
Direct API calls to `/api/groups` from external services need updating:
```bash
# Before
curl http://localhost:5003/api/groups

# After (for user's groups)
curl http://localhost:5003/api/groups/my-groups

# Or (for all groups)
curl http://localhost:5003/api/groups/browse
```

---

## Contributors
- Fixed by: [Your Team]
- Reported by: User testing
- Date: 2024-01-XX

