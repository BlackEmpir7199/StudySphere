import { useState, useEffect } from 'react';
import { groupsAPI } from '../../lib/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Users, Check, X, Search, Filter } from 'lucide-react';

export default function BrowseGroups({ onClose, onJoin }) {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, members

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await groupsAPI.browseGroups();
      setGroups(response.data.groups);
      setFilteredGroups(response.data.groups);
    } catch (error) {
      console.error('Failed to browse groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort groups
  useEffect(() => {
    let filtered = [...groups];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort groups
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'members':
          return b._count.members - a._count.members;
        default:
          return 0;
      }
    });

    setFilteredGroups(filtered);
  }, [groups, searchTerm, sortBy]);

  const handleJoin = async (groupId) => {
    setJoiningId(groupId);
    try {
      await groupsAPI.join(groupId);
      // Refresh groups list
      await loadGroups();
      // Notify parent to refresh groups in sidebar
      if (onJoin) {
        onJoin(groupId);
      }
    } catch (error) {
      console.error('Failed to join group:', error);
      // Handle 409 Conflict (already a member) gracefully
      if (error.response?.status === 409) {
        // User is already a member, just refresh the UI
        await loadGroups();
        if (onJoin) {
          onJoin(groupId);
        }
      } else {
        alert(error.response?.data?.error || 'Failed to join group');
      }
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading groups...
      </div>
    );
  }

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Browse Study Groups</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Find and join study groups that match your interests
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search groups by name, description, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'newest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('newest')}
          >
            Newest
          </Button>
          <Button
            variant={sortBy === 'oldest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('oldest')}
          >
            Oldest
          </Button>
          <Button
            variant={sortBy === 'members' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('members')}
          >
            Most Members
          </Button>
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
          {searchTerm ? (
            <>
              <p className="text-lg">No groups found</p>
              <p className="text-sm mt-2">Try adjusting your search terms</p>
            </>
          ) : (
            <>
              <p className="text-lg">No groups available yet</p>
              <p className="text-sm mt-2">Be the first to create one!</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.map((group) => (
            <Card key={group.id} className={group.isMember ? 'border-primary/50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {group.name}
                      {group.isMember && (
                        <span className="inline-flex items-center gap-1 text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <Check className="h-3 w-3" />
                          Joined
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {group.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {group._count.members} {group._count.members === 1 ? 'member' : 'members'}
                  </span>
                  <span>
                    {group._count.channels} {group._count.channels === 1 ? 'channel' : 'channels'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Created by {group.owner.email}
                </div>
              </CardContent>
              <CardFooter>
                {group.isMember ? (
                  <Button variant="outline" className="w-full" disabled>
                    <Check className="h-4 w-4 mr-2" />
                    Already Joined
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleJoin(group.id)}
                    disabled={joiningId === group.id}
                  >
                    {joiningId === group.id ? 'Joining...' : 'Join Group'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

