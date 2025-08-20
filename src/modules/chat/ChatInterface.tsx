'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BotMessageSquare, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { smoothScrollToBottom, scrollToBottomOnOpen } from '@/lib/messaging/storage';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
}

export function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      smoothScrollToBottom(messagesContainerRef);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when component mounts (chat opens)
  useEffect(() => {
    scrollToBottomOnOpen(messagesContainerRef);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role !== 'user' && (
              <div className="rounded-full bg-[#FEB64D] self-start p-1">
                <BotMessageSquare />
              </div>
            )}
            <div
              className={`rounded-lg p-3 ${message.role === 'user'
                ? 'bg-[#FEB64D] text-black'
                : 'bg-[#2a2a2a] text-white'
                }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#2a2a2a] text-white rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 pb-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border border-[#FEB64D] rounded-xl">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Talk with SplitSafe AI"
            className='bg-transparent border-0 !focus:border-0'
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={!inputValue.trim() || isLoading}
            className="disabled:opacity-50"
          >
            <Send size={14} color="#FEB64D" />
          </Button>
        </form>
      </div>
    </div>
  );
}
