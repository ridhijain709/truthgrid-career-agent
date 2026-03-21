'use client';

import { useState, useRef, useEffect } from 'react';
import MainLayout from '@/components/Layouts/MainLayout';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAI } from '@/hooks/useAI';
import { Send, Bot, User, Lightbulb, MessageSquare } from 'lucide-react';
import { ChatMessage } from '@/types';

export default function AITutorPage() {
  const { messages, loading, error, sendMessage, loadChatHistory } = useAI();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput('');
    
    try {
      await sendMessage(message);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const quickPrompts = [
    "How can I improve my technical skills?",
    "What career paths are best for my profile?",
    "How do I prepare for job interviews?",
    "What skills are in high demand?",
    "How can I build a strong portfolio?",
  ];

  const formatMessageContent = (content: string) => {
    // Simple formatting for bullet points and bold text
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\* (.*?)(\n|$)/g, '• $1$2')
      .replace(/\n/g, '<br />');
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            AI Career Tutor
          </h1>
          <p className="text-gray-400">
            Get personalized career guidance and skill development advice
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-card-dark rounded-lg card-shadow flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-text-dark mb-2">
                  Welcome to AI Career Tutor!
                </h3>
                <p className="text-gray-400 mb-6">
                  I&apos;m here to help you improve your skills and advance your career. Ask me anything!
                </p>
                
                {/* Quick Prompts */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 mb-3">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickPrompts.slice(0, 3).map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setInput(prompt)}
                        className="px-3 py-2 text-xs bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            
            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-500/10 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-500" />
                </div>
                <div className="bg-gray-700 rounded-lg px-4 py-3 max-w-md">
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-gray-300">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            {input === '' && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(prompt)}
                      className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
                    >
                      <Lightbulb className="w-3 h-3 inline mr-1" />
                      {prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about career guidance, skills, or job opportunities..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-text-dark placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="text-center py-2">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-400 bg-gray-800/50 rounded-full px-4 py-2">
          <MessageSquare className="w-4 h-4" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-500/10' : 'bg-primary-500/10'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-blue-500" />
        ) : (
          <Bot className="w-4 h-4 text-primary-500" />
        )}
      </div>
      
      <div className={`max-w-md lg:max-w-2xl ${isUser ? 'text-right' : ''}`}>
        <div className={`rounded-lg px-4 py-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-100'
        }`}>
          <div 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\* (.*?)(\n|$)/g, '• $1$2')
                .replace(/\n/g, '<br />')
            }}
          />
        </div>
        
        <div className="mt-1 text-xs text-gray-400">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}