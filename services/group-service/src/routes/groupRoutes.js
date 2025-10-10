const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../../shared/utils/auth');
const groupController = require('../controllers/groupController');
const channelController = require('../controllers/channelController');

// Group routes
router.get('/my-groups', authenticate, groupController.getMyGroups);
router.get('/browse', authenticate, groupController.browseGroups);
router.get('/:id', authenticate, groupController.getGroupById);
router.post('/', authenticate, groupController.createGroup);
router.patch('/:id', authenticate, groupController.updateGroup);
router.delete('/:id', authenticate, groupController.deleteGroup);
router.post('/:id/join', authenticate, groupController.joinGroup);
router.post('/:id/leave', authenticate, groupController.leaveGroup);

// Channel routes
router.get('/:id/channels', authenticate, channelController.getChannels);
router.post('/:id/channels', authenticate, channelController.createChannel);
router.delete('/channels/:id', authenticate, channelController.deleteChannel);

module.exports = router;

