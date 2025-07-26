import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { VoiceButton } from './VoiceButton';
import { LanguageSelector } from './LanguageSelector';
import { ChatMessage } from './ChatMessage';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Send, ArrowLeft, AlertCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { geminiService } from '@/services/gemini';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onBack: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load conversation history on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(`messages_${conversationId}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    }
  }, [conversationId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`messages_${conversationId}`, JSON.stringify(messages));
    }
  }, [messages, conversationId]);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: speechSupported,
    error: speechError
  } = useSpeechRecognition(getLanguageCode(selectedLanguage));

  const { speak, isSpeaking, stop: stopSpeech } = useSpeechSynthesis();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle speech recognition transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setInputValue(transcript);
    }
  }, [transcript, isListening]);

  // Show speech errors
  useEffect(() => {
    if (speechError) {
      toast({
        title: 'Speech Recognition Error',
        description: speechError,
        variant: 'destructive'
      });
    }
  }, [speechError, toast]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await geminiService.generateResponse(
        text.trim(), 
        selectedLanguage,
        conversationId
      );
      
      if (response.error) {
        throw new Error(response.error);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the response
      speak(response.text, getLanguageCode(selectedLanguage));
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Failed to get response from AI. Please try again.';
      toast({
        title: 'Error',
        description: errorText,
        variant: 'destructive'
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleVoiceStart = () => {
    if (!speechSupported) {
      toast({
        title: 'Speech Not Supported',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive'
      });
      return;
    }
    startListening();
  };

  const handlePlayAudio = (messageText: string) => {
    speak(messageText, getLanguageCode(selectedLanguage));
  };

  const clearConversation = () => {
    setMessages([]);
    geminiService.clearConversation(conversationId);
    localStorage.removeItem(`messages_${conversationId}`);
    toast({
      title: "Conversation Cleared",
      description: "Your chat history has been cleared",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="glass border-b border-white/10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">AI Voice Assistant</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              title="Clear conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="min-h-[60vh] mb-6">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-primary-glow rounded-full animate-pulse" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Start a Conversation</h2>
              <p className="text-muted-foreground mb-6">
                Ask me anything or use voice input to get started!
              </p>
              {!speechSupported && (
                <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive rounded-lg px-4 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Speech recognition not supported in this browser</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onPlayAudio={!message.isUser ? () => handlePlayAudio(message.text) : undefined}
                  isPlaying={isSpeaking}
                />
              ))}
              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-card border border-white/20 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <Card className="glass border-white/10 p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-sm text-white/70">AI is thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <Card className="glass border-white/10 p-4">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type your message or use voice input..."}
                disabled={isLoading || isListening}
                className="bg-transparent border-white/20 focus:border-primary resize-none"
              />
            </div>
            
            <VoiceButton
              isListening={isListening}
              onStartListening={handleVoiceStart}
              onStopListening={stopListening}
              disabled={isLoading}
            />
            
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading || isListening}
              variant="default"
              size="lg"
              className="h-14 px-6"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
          
          {isListening && (
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-2 text-voice-active text-sm">
                <div className="w-2 h-2 bg-voice-active rounded-full animate-pulse" />
                Listening... Speak now
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

// Helper function to convert language codes
function getLanguageCode(lang: string): string {
  const langMap: Record<string, string> = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'ko': 'ko-KR'
  };
  return langMap[lang] || 'en-US';
}
