import React, { useState } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { ChatInterface } from '@/components/ChatInterface';

const Index = () => {
  const [showChat, setShowChat] = useState(false);

  const handleGetStarted = () => {
    setShowChat(true);
  };

  const handleBackToLanding = () => {
    setShowChat(false);
  };

  return (
    <>
      {showChat ? (
        <ChatInterface onBack={handleBackToLanding} />
      ) : (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
    </>
  );
};

export default Index;
