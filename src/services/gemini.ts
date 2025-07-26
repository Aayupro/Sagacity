import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBJhmB_tTRfAYNggAxJev8cBfYoaQJyp9E';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface ConversationMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  private conversationHistory: ConversationMessage[] = [];

  async generateResponse(
    prompt: string, 
    language: string = 'en',
    conversationId?: string
  ): Promise<GeminiResponse> {
    try {
      // Load conversation history from localStorage if conversationId provided
      if (conversationId) {
        this.loadConversationHistory(conversationId);
      }

      // Add language context to prompt
      const languageContext = this.getLanguageContext(language);
      const enhancedPrompt = `${languageContext}\n\nUser: ${prompt}`;

      // Add current message to conversation history
      this.conversationHistory.push({
        role: 'user',
        parts: prompt
      });

      let result;
      
      if (this.conversationHistory.length > 1) {
        // Use chat for continuing conversations
        const chat = this.model.startChat({
          history: this.conversationHistory.slice(0, -1).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.parts }]
          }))
        });
        result = await chat.sendMessage(enhancedPrompt);
      } else {
        // Use generateContent for first message
        result = await this.model.generateContent(enhancedPrompt);
      }

      const response = await result.response;
      const text = response.text();

      // Add AI response to conversation history
      this.conversationHistory.push({
        role: 'model',
        parts: text
      });

      // Save conversation history to localStorage if conversationId provided
      if (conversationId) {
        this.saveConversationHistory(conversationId);
      }

      return { text };
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
          return { 
            text: '', 
            error: 'Invalid API key. Please check your Gemini API configuration.' 
          };
        }
        if (error.message.includes('quota')) {
          return { 
            text: '', 
            error: 'API quota exceeded. Please try again later.' 
          };
        }
        if (error.message.includes('SAFETY')) {
          return { 
            text: '', 
            error: 'Content filtered for safety. Please rephrase your question.' 
          };
        }
      }

      return { 
        text: '', 
        error: 'Failed to get response from AI. Please try again.' 
      };
    }
  }

  private getLanguageContext(language: string): string {
    const languageMap: Record<string, string> = {
      'en': 'Please respond in English.',
      'hi': 'Please respond in Hindi (हिंदी).',
      'es': 'Please respond in Spanish (Español).',
      'fr': 'Please respond in French (Français).',
      'de': 'Please respond in German (Deutsch).',
      'zh': 'Please respond in Chinese (中文).',
      'ja': 'Please respond in Japanese (日本語).',
      'ko': 'Please respond in Korean (한국어).'
    };

    return languageMap[language] || languageMap['en'];
  }

  private loadConversationHistory(conversationId: string): void {
    try {
      const saved = localStorage.getItem(`conversation_${conversationId}`);
      if (saved) {
        this.conversationHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }

  private saveConversationHistory(conversationId: string): void {
    try {
      // Keep only last 20 messages to prevent localStorage bloat
      const trimmedHistory = this.conversationHistory.slice(-20);
      localStorage.setItem(
        `conversation_${conversationId}`, 
        JSON.stringify(trimmedHistory)
      );
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  }

  clearConversation(conversationId?: string): void {
    this.conversationHistory = [];
    if (conversationId) {
      localStorage.removeItem(`conversation_${conversationId}`);
    }
  }

  getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }
}

export const geminiService = new GeminiService();
