import { useState, useEffect } from 'react';
import { groupsAPI } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Users, Crown, Shield, User, X } from 'lucide-react';

export default function GroupSettings({ group, open, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && group) {
      loadMembers();
    }
  }, [open, group]);

  const loadMembers = async () => {
    try {
      const response = await groupsAPI.getById(group.id);
      setMembers(response.data.group.members || []);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!group) return null;

  const getRoleIcon = (role) => {
    if (role === 'admin') return <Crown className="h-4 w-4 text-yellow-500" />;
    if (role === 'moderator') return <Shield className="h-4 w-4 text-blue-500" />;
    return <User className="h-4 w-4 text-muted-foreground" />;
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      moderator: 'bg-blue-100 text-blue-700 border-blue-200',
      member: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
      <span className={`px-2 py-0.5 text-xs rounded-full border ${colors[role] || colors.member}`}>
        {role}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{group.name}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {group.description}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-6">
          {/* Group Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">
              Group Information
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Owner</p>
                <p className="text-sm font-medium">{group.owner?.email || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {new Date(group.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Members</p>
                <p className="text-sm font-medium">{members.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Channels</p>
                <p className="text-sm font-medium">{group.channels?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members ({members.length})
            </h3>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading members...
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getRoleIcon(member.role)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(member.role)}
                      {group.ownerId === member.userId && (
                        <span className="text-xs text-yellow-600 font-medium">
                          Owner
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Channels List */}
          {group.channels && group.channels.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                Channels ({group.channels.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {group.channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="p-2 rounded border bg-card text-sm"
                  >
                    # {channel.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

