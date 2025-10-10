const { PrismaClient } = require('../../../../shared/node_modules/@prisma/client');
const prisma = new PrismaClient();

// Get group channels
exports.getChannels = async (req, res) => {
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
};

// Create channel in group
exports.createChannel = async (req, res) => {
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
};

// Delete channel
exports.deleteChannel = async (req, res) => {
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
};

