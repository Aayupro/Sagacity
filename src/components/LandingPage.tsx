import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Mic, Globe, Zap } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-8">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Voice Assistant</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Talk to AI
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Experience the future of conversation with our intelligent voice chatbot. 
            Speak naturally, get instant responses, and communicate in your language.
          </p>
          
          <Button 
            variant="hero" 
            size="lg" 
            onClick={onGetStarted}
            className="text-lg px-8 py-4 h-auto animate-pulse-glow"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Get Started
          </Button>
        </header>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <Card className="glass border-white/10 p-6 text-center hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-voice rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Voice Recognition</h3>
            <p className="text-muted-foreground">
              Advanced speech-to-text technology that understands your voice clearly and accurately.
            </p>
          </Card>

          <Card className="glass border-white/10 p-6 text-center hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Responses</h3>
            <p className="text-muted-foreground">
              Powered by advanced AI that provides intelligent, contextual responses to your queries.
            </p>
          </Card>

          <Card className="glass border-white/10 p-6 text-center hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Language</h3>
            <p className="text-muted-foreground">
              Communicate in multiple languages with automatic translation and localization support.
            </p>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto border-white/10">
            <h2 className="text-2xl font-bold mb-4">Ready to Experience AI Conversation?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of users who are already enjoying seamless voice interactions with AI.
            </p>
            <Button 
              variant="hero" 
              size="lg" 
              onClick={onGetStarted}
              className="text-lg px-8 py-4 h-auto"
            >
              Start Talking Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};