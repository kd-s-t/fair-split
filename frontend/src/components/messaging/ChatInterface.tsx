import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClearChat?: () => void;
  isLoading?: boolean;
}

export function ChatInterface({ 
  isOpen, 
  onClose, 
  messages, 
  onSendMessage, 
  onClearChat,
  isLoading = false 
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-[#222] rounded-xl shadow-2xl border border-[#333] flex flex-col">
      {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-[#FEB64D]" />
            <h3 className="font-semibold text-white">SplitSafe Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            {onClearChat && messages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearChat}
                className="h-8 w-8 text-gray-400 hover:text-red-400"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <Bot className="h-12 w-12 mx-auto mb-3 text-[#FEB64D]" />
            <p className="text-sm">Ask me anything about SplitSafe!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <Bot className="h-6 w-6 text-[#FEB64D]" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-[#FEB64D] text-[#0D0D0D]'
                    : 'bg-[#333] text-white'
                )}
              >
                {message.content}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <User className="h-6 w-6 text-[#FEB64D]" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Bot className="h-6 w-6 text-[#FEB64D]" />
            <div className="bg-[#333] rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#FEB64D]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#333]">
        <div className="flex gap-2">
                      <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message... (Press Enter to send)"
              disabled={isLoading}
              className="flex-1 bg-[#333] border-[#444] text-white placeholder:text-gray-400"
              onKeyDown={handleKeyDown}
            />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-[#0D0D0D]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
} 