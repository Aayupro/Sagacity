import React from 'react';
import { Card } from '@/components/ui/card';
import { Bot, User, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  };
  onPlayAudio?: () => void;
  isPlaying?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onPlayAudio, 
  isPlaying = false 
}) => {
  return (
    <div className={`flex gap-4 mb-6 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        message.isUser 
          ? 'bg-gradient-primary' 
          : 'bg-gradient-card border border-white/20'
      }`}>
        {message.isUser ? (
          <User className="h-5 w-5 text-foreground" />
        ) : (
          <Bot className="h-5 w-5 text-primary" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${message.isUser ? 'text-right' : 'text-left'}`}>
        <Card className={`p-4 ${
          message.isUser 
            ? 'bg-gradient-primary text-primary-foreground border-0' 
            : 'glass border-white/10'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
          
          {/* Audio playback button for AI messages */}
          {!message.isUser && onPlayAudio && (
            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPlayAudio}
                disabled={isPlaying}
                className="h-8 w-8 p-0 hover:bg-white/10"
              >
                <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              </Button>
            </div>
          )}
        </Card>
        
        <div className={`text-xs text-muted-foreground mt-1 ${
          message.isUser ? 'text-right' : 'text-left'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};