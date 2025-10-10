import { useState, useEffect, useRef } from 'react';
import { Send, Hash } from 'lucide-react';
import { chatAPIs } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function ChatArea({ channel, group, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [moderationWarning, setModerationWarning] = useState(null);
  const messagesEndRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    if (channel) {
      loadMessages();
      joinChannel();
    }

    return () => {
      if (channel && socket) {
        socket.emit('channel:leave', channel.id);
      }
    };
  }, [channel]);

  useEffect(() => {
    if (!socket) return;

    socket.on('message:received', (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    socket.on('message:moderated', (data) => {
      setModerationWarning(`Your message was moderated: ${data.reason}`);
      setTimeout(() => setModerationWarning(null), 5000);
    });

    return () => {
      socket.off('message:received');
      socket.off('message:moderated');
    };
  }, [socket]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatAPIs.getMessages(channel.id);
      setMessages(response.data.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChannel = () => {
    if (socket) {
      socket.emit('channel:join', channel.id);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;

    socket.emit('message:send', {
      channelId: channel.id,
      text: newMessage,
    });

    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Channel header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-background">
        <Hash className="h-5 w-5 text-muted-foreground" />
        <div>
          <h2 className="font-semibold">{channel.name}</h2>
          <p className="text-xs text-muted-foreground">{group.name}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Hash className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-lg font-medium">Welcome to #{channel.name}</p>
            <p className="text-sm">This is the start of your conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3 hover:bg-accent/50 -mx-2 px-2 py-1 rounded">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  {message.user.email[0].toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-sm">{message.user.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.isModerated && (
                    <span className="text-xs text-destructive font-medium">
                      [Moderated]
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-0.5 break-words ${message.isModerated ? 'text-muted-foreground italic' : ''}`}>
                  {message.text}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Moderation warning */}
      {moderationWarning && (
        <div className="mx-4 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
          {moderationWarning}
        </div>
      )}

      {/* Message input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder={`Message #${channel.name}`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

