import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { groupsAPI } from '../lib/api';
import { initSocket, disconnectSocket } from '../lib/socket';
import Sidebar from '../components/dashboard/Sidebar';
import ChatArea from '../components/dashboard/ChatArea';
import RightPanel from '../components/dashboard/RightPanel';
import { Button } from '../components/ui/button';
import { Menu, X } from 'lucide-react';

export default function DashboardPage({ user: initialUser, onLogout }) {
  const [user, setUser] = useState(initialUser);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  useEffect(() => {
    loadGroups();
    
    // Initialize socket connection (uses cookies automatically)
    initSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  const loadGroups = async () => {
    try {
      // Load only groups the user is a member of
      const response = await groupsAPI.getMyGroups();
      setGroups(response.data.groups);
      
      // Auto-select first group if available
      if (response.data.groups.length > 0 && !selectedGroup) {
        const firstGroup = response.data.groups[0];
        setSelectedGroup(firstGroup);
        if (firstGroup.channels && firstGroup.channels.length > 0) {
          setSelectedChannel(firstGroup.channels[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    if (group.channels && group.channels.length > 0) {
      setSelectedChannel(group.channels[0]);
    } else {
      setSelectedChannel(null);
    }
    setSidebarOpen(false);
  };

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    setSidebarOpen(false);
  };

  const handleCreateGroup = async (groupData) => {
    try {
      await groupsAPI.create(groupData);
      await loadGroups();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await groupsAPI.join(groupId);
      await loadGroups();
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b px-4 py-2 flex items-center justify-between">
        <h1 className="text-xl font-bold">StudySphere</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-40 transition-transform duration-200 ease-in-out`}
      >
        <Sidebar
          groups={groups}
          selectedGroup={selectedGroup}
          selectedChannel={selectedChannel}
          onGroupSelect={handleGroupSelect}
          onChannelSelect={handleChannelSelect}
          onCreateGroup={handleCreateGroup}
          onJoinGroup={handleJoinGroup}
          user={user}
          onLogout={onLogout}
          onUserUpdate={handleUserUpdate}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden mt-14 lg:mt-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedChannel ? (
            <ChatArea
              channel={selectedChannel}
              group={selectedGroup}
              user={user}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {groups.length === 0 ? (
                <div className="text-center space-y-4">
                  <p className="text-lg">Welcome to StudySphere!</p>
                  <p>Create or join a study group to get started.</p>
                </div>
              ) : (
                <p>Select a channel to start chatting</p>
              )}
            </div>
          )}
        </div>

        {/* Right panel - Events & Resources */}
        {selectedChannel && (
          <div className="hidden xl:block w-80 border-l">
            <RightPanel
              channel={selectedChannel}
              user={user}
            />
          </div>
        )}
      </div>
    </div>
  );
}

