import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types/game';
import { Send, MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  currentUserId?: string;
}

export function ChatPanel({ messages, onSendMessage, isOpen, onToggle, currentUserId }: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 gap-2 z-50"
      >
        <MessageCircle className="w-4 h-4" />
        Chat ({messages.length})
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-card border rounded-lg shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <h3 className="font-semibold">Game Chat</h3>
        </div>
        <Button
          onClick={onToggle}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "p-2 rounded-lg text-sm",
                message.type === 'system' 
                  ? "bg-muted text-muted-foreground text-center italic"
                  : message.playerId === currentUserId
                    ? "bg-primary text-primary-foreground ml-8"
                    : "bg-muted mr-8"
              )}
            >
              {message.type === 'chat' && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-xs">
                    {message.playerName}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              )}
              <div>{message.message}</div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={200}
          />
          <Button type="submit" size="sm" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}