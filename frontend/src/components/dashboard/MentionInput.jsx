import { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/input';
import { Sparkles } from 'lucide-react';

export default function MentionInput({ 
  value, 
  onChange, 
  onSubmit, 
  members = [], 
  placeholder,
  disabled 
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    // Check if user typed @ and get the search query
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Check if there's no space after @
      if (!textAfterAt.includes(' ')) {
        const query = textAfterAt.toLowerCase();
        
        // Check for @sphere AI assistant
        if ('sphere'.startsWith(query)) {
          setSuggestions([{ id: 'sphere', user: { name: 'Sphere', email: 'AI Assistant' }, isAI: true }]);
          setShowSuggestions(true);
          setMentionStart(lastAtIndex);
          setSelectedIndex(0);
          return;
        }
        
        // Filter members by name or email
        const filtered = members.filter(member => {
          const name = member.user?.name || member.user?.email || '';
          const email = member.user?.email || '';
          return name.toLowerCase().includes(query) || 
                 email.toLowerCase().includes(query);
        });

        if (filtered.length > 0) {
          setSuggestions(filtered);
          setShowSuggestions(true);
          setMentionStart(lastAtIndex);
          setSelectedIndex(0);
          return;
        }
      }
    }

    setShowSuggestions(false);
  }, [value, members]);

  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const insertMention = (member) => {
    const mentionText = `@${member.user.name || member.user.email}`;
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(inputRef.current?.selectionStart || value.length);
    
    const newValue = beforeMention + mentionText + ' ' + afterMention;
    onChange({ target: { value: newValue } });
    
    setShowSuggestions(false);
    
    // Focus input after mention
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSuggestionClick = (member) => {
    insertMention(member);
  };

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex-1"
      />
      
      {/* Mention suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((member, index) => (
            <button
              key={member.id}
              type="button"
              onClick={() => handleSuggestionClick(member)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors ${
                index === selectedIndex ? 'bg-accent' : ''
              }`}
            >
              {member.isAI ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {(member.user.name || member.user.email)[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.user.name || member.user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {member.user.email}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

