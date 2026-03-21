import { useState } from 'react';
import { ChatMessage } from '@/types';
import { apiClient } from '@/lib/api';

export function useAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string): Promise<void> => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const aiResponse = await apiClient.sendChatMessage(content);
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the user message if the AI response failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const chatHistory = await apiClient.getChatMessages();
      setMessages(chatHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadChatHistory,
    clearMessages,
  };
}

export function useAIAnalysis() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async (studentData: any): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Mock AI analysis generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis = `
        Based on the comprehensive assessment, here are key insights:
        
        **Strengths:**
        - Demonstrates strong analytical thinking capabilities
        - Shows consistent improvement in technical areas
        - Excellent problem-solving approach
        
        **Development Areas:**
        - Communication skills need enhancement
        - Time management could be improved
        - Leadership experience is limited
        
        **Recommendations:**
        1. Join public speaking clubs or presentation opportunities
        2. Take on project management roles in group settings
        3. Seek mentorship in areas of weakness
        4. Practice coding challenges regularly
        
        **Career Trajectory:**
        With focused development, strong potential for senior technical roles within 3-5 years.
      `;

      setAnalysis(mockAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setError(null);
  };

  return {
    analysis,
    loading,
    error,
    generateAnalysis,
    clearAnalysis,
  };
}