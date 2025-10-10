import { useState } from 'react';
import { Hash, Plus, LogOut, Users, UserCircle, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DarkModeToggle } from '../ui/DarkModeToggle';
import BrowseGroupsDialog from './BrowseGroups';
import UserProfile from './UserProfile';
import GroupSettings from './GroupSettings';

export default function Sidebar({
  groups,
  selectedGroup,
  selectedChannel,
  onGroupSelect,
  onChannelSelect,
  onCreateGroup,
  onJoinGroup,
  user,
  onLogout,
  onUserUpdate,
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [settingsGroup, setSettingsGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const handleGroupSettings = (group) => {
    setSettingsGroup(group);
    setShowGroupSettings(true);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    await onCreateGroup({ name: groupName, description: groupDescription });
    setGroupName('');
    setGroupDescription('');
    setShowCreateDialog(false);
  };

  return (
    <div className="w-64 bg-muted/40 h-screen flex flex-col border-r">
      {/* User info header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">
              {user.name || user.email}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {user.name ? user.email : (user.interests?.length > 0 ? user.interests[0] : 'Student')}
            </p>
          </div>
          <div className="flex gap-1">
            <DarkModeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowProfileDialog(true)} 
              title="Edit Profile"
            >
              <UserCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfile
        user={user}
        open={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        onUpdate={onUserUpdate}
      />

      {/* Groups list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">
              Study Groups
            </h3>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateGroup}>
                  <DialogHeader>
                    <DialogTitle>Create Study Group</DialogTitle>
                    <DialogDescription>
                      Create a new study group to collaborate with peers
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="groupName">Group Name</Label>
                      <Input
                        id="groupName"
                        placeholder="CS Study Group"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groupDescription">Description</Label>
                      <Input
                        id="groupDescription"
                        placeholder="Algorithms and Data Structures"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Group</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {groups.length === 0 ? (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              No groups yet. Create one!
            </div>
          ) : (
            <div className="space-y-1">
              {groups.map((group) => (
                <div key={group.id}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onGroupSelect(group)}
                      className={`flex-1 flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                        selectedGroup?.id === group.id
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{group.name}</span>
                    </button>
                    {selectedGroup?.id === group.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleGroupSettings(group)}
                        title="Group Settings"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Channels for selected group */}
                  {selectedGroup?.id === group.id && group.channels && (
                    <div className="ml-4 mt-1 space-y-1">
                      {group.channels.map((channel) => (
                        <button
                          key={channel.id}
                          onClick={() => onChannelSelect(channel)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                            selectedChannel?.id === channel.id
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-accent text-muted-foreground'
                          }`}
                        >
                          <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{channel.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Discover groups button */}
      <div className="p-4 border-t">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Browse Groups
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
            <BrowseGroupsDialog onJoin={onJoinGroup} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Group Settings Modal */}
      <GroupSettings
        group={settingsGroup}
        open={showGroupSettings}
        onClose={() => setShowGroupSettings(false)}
      />
    </div>
  );
}

