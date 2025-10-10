import { useState, useEffect } from 'react';
import { Calendar, FileText, Plus, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { chatAPIs } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

export default function RightPanel({ channel, user }) {
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const socket = getSocket();

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLink, setEventLink] = useState('');
  const [eventDate, setEventDate] = useState('');

  // Resource form state
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceContent, setResourceContent] = useState('');
  const [isAddingResource, setIsAddingResource] = useState(false);

  useEffect(() => {
    if (channel) {
      loadEvents();
      loadResources();
    }
  }, [channel]);

  useEffect(() => {
    if (!socket) return;

    socket.on('event:created', (event) => {
      setEvents((prev) => [...prev, event]);
    });

    socket.on('resource:created', (resource) => {
      setResources((prev) => [resource, ...prev]);
    });

    socket.on('resource:updated', (updatedResource) => {
      setResources((prev) =>
        prev.map((r) => (r.id === updatedResource.id ? updatedResource : r))
      );
    });

    socket.on('resource:summarized', (updatedResource) => {
      setResources((prev) =>
        prev.map((r) => (r.id === updatedResource.id ? updatedResource : r))
      );
    });

    return () => {
      socket.off('event:created');
      socket.off('resource:created');
      socket.off('resource:updated');
      socket.off('resource:summarized');
    };
  }, [socket]);

  const loadEvents = async () => {
    try {
      const response = await chatAPIs.getEvents(channel.id);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const loadResources = async () => {
    try {
      const response = await chatAPIs.getResources(channel.id);
      setResources(response.data.resources);
    } catch (error) {
      console.error('Failed to load resources:', error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await chatAPIs.createEvent(channel.id, {
        title: eventTitle,
        description: eventDescription,
        gmeetLink: eventLink,
        scheduledDate: new Date(eventDate).toISOString(),
      });
      
      // Refresh events to show the new one
      await loadEvents();
      
      setEventTitle('');
      setEventDescription('');
      setEventLink('');
      setEventDate('');
      setShowEventDialog(false);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert(error.response?.data?.error || 'Failed to create event');
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setIsAddingResource(true);
    try {
      const formData = new FormData();
      formData.append('title', resourceTitle);
      formData.append('url', resourceUrl);

      const response = await chatAPIs.uploadResource(channel.id, formData);
      
      // Auto-summarize if content provided
      if (resourceContent.trim()) {
        await chatAPIs.summarizeResource(response.data.resource.id, resourceContent);
      }

      // Refresh resources to show the new one
      await loadResources();

      setResourceTitle('');
      setResourceUrl('');
      setResourceContent('');
      setShowResourceDialog(false);
    } catch (error) {
      console.error('Failed to create resource:', error);
      alert(error.response?.data?.error || 'Failed to create resource');
    } finally {
      setIsAddingResource(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs defaultValue="events" className="flex-1 flex flex-col">
        <div className="border-b px-4 py-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
        </div>

        {/* Events Tab */}
        <TabsContent value="events" className="flex-1 overflow-y-auto m-0 p-4 space-y-3">
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateEvent}>
                <DialogHeader>
                  <DialogTitle>Schedule Study Session</DialogTitle>
                  <DialogDescription>
                    Create a new event for this channel
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventTitle">Title</Label>
                    <Input
                      id="eventTitle"
                      placeholder="Study Session"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventDescription">Description</Label>
                    <Input
                      id="eventDescription"
                      placeholder="Review Chapter 5"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventLink">Google Meet Link</Label>
                    <Input
                      id="eventLink"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      value={eventLink}
                      onChange={(e) => setEventLink(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Date & Time</Label>
                    <Input
                      id="eventDate"
                      type="datetime-local"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Event</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No upcoming events</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(event.scheduledDate)}
                    </p>
                    {event.gmeetLink && (
                      <a
                        href={event.gmeetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="flex-1 overflow-y-auto m-0 p-4 space-y-3">
          <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
            <DialogTrigger asChild>
              <Button className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateResource}>
                <DialogHeader>
                  <DialogTitle>Share Resource</DialogTitle>
                  <DialogDescription>
                    Add a resource and get an AI-generated summary
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="resourceTitle">Title</Label>
                    <Input
                      id="resourceTitle"
                      placeholder="Data Structures Notes"
                      value={resourceTitle}
                      onChange={(e) => setResourceTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resourceUrl">URL or Link</Label>
                    <Input
                      id="resourceUrl"
                      placeholder="https://..."
                      value={resourceUrl}
                      onChange={(e) => setResourceUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resourceContent">
                      Content (optional, for AI summary)
                    </Label>
                    <textarea
                      id="resourceContent"
                      placeholder="Paste content here for AI summarization..."
                      value={resourceContent}
                      onChange={(e) => setResourceContent(e.target.value)}
                      className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isAddingResource}>
                    {isAddingResource ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Add Resource'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No resources yet</p>
            </div>
          ) : (
            resources.map((resource) => (
              <div key={resource.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{resource.title}</h4>
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Resource
                      </a>
                    )}
                    {resource.summary && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs space-y-1">
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <Sparkles className="h-3 w-3" />
                          AI Summary
                        </div>
                        <div className="text-muted-foreground">
                          <MarkdownRenderer content={resource.summary} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

