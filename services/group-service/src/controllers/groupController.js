const { PrismaClient } = require('../../../../shared/node_modules/@prisma/client');
const prisma = new PrismaClient();

// Get user's groups (groups they are a member of)
exports.getMyGroups = async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
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
    console.error('Get my groups error:', error);
    res.status(500).json({ error: 'Failed to get groups' });
  }
};

// Browse all available groups (for joining)
exports.browseGroups = async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            channels: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check which groups the user is already a member of
    const userMemberships = await prisma.groupMember.findMany({
      where: { userId: req.user.id },
      select: { groupId: true },
    });

    const memberGroupIds = new Set(userMemberships.map(m => m.groupId));

    // Add isMember flag to each group
    const groupsWithMembership = groups.map(group => ({
      ...group,
      isMember: memberGroupIds.has(group.id),
    }));

    res.json({ groups: groupsWithMembership });
  } catch (error) {
    console.error('Browse groups error:', error);
    res.status(500).json({ error: 'Failed to browse groups' });
  }
};

// Get group by ID
exports.getGroupById = async (req, res) => {
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
};

// Create new group
exports.createGroup = async (req, res) => {
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
};

// Update group
exports.updateGroup = async (req, res) => {
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
};

// Delete group
exports.deleteGroup = async (req, res) => {
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
};

// Join group
exports.joinGroup = async (req, res) => {
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
};

// Leave group
exports.leaveGroup = async (req, res) => {
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
};

