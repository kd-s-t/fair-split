'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BotMessageSquare, X, Send } from 'lucide-react';
import { Message } from './ChatInterface';
import { saveMessages, loadMessages } from '@/lib/messaging/storage';
import { generateActionResponse } from '@/lib/messaging/actionParser';
import { parseUserMessageWithAI } from '@/lib/messaging/aiParser';
import { handleEscrowCreation, handleApprovalSuggestion, handleBitcoinAddressSet, executeNavigation, setRouter } from '@/lib/messaging/navigationService';
import { getGlobalChatState } from '@/lib/messaging/chatState';
import { useRouter } from 'next/navigation';
import { ParsedAction } from '@/lib/messaging/actionParser';

import { useUser } from '@/hooks/useUser';
import { Input } from '@/components/ui/input';

interface RightSidebarProps {
  onToggle: () => void
}

export default function RightSidebar({ onToggle }: RightSidebarProps) {
  const router = useRouter();
  const { principal, icpBalance, ckbtcAddress, ckbtcBalance } = useUser();

  const [messages, setMessages] = useState<Message[]>(() => {
    const globalState = getGlobalChatState();
    if (globalState.messages.length > 0) {
      return globalState.messages;
    }
    const savedMessages = loadMessages();
    return savedMessages;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Set router for navigation service
  useEffect(() => {
    setRouter(router);
  }, [router]);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const globalState = getGlobalChatState();
    if (globalState.messages.length === 0) {
      const savedMessages = loadMessages();
      if (savedMessages.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome',
          content: "Hi, I'm your SplitSafe Assistant! I can help you with two things:\n\n1. Create an escrow. Just tell me who you're sending Bitcoin to and how much.\n\n2. Decide on received escrows. I can help you choose to approve or decline based on what's best.\n\nJust type what you need and I'll take care of the rest.",
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(savedMessages);
      }
    }
  }, []);

  // Save messages to localStorage and update global state whenever messages change
  useEffect(() => {
    saveMessages(messages);
    const globalState = getGlobalChatState();
    globalState.messages = messages;
  }, [messages]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

      let parsedAction: ParsedAction = null;

      if (apiKey && apiKey.trim() !== '' && apiKey !== 'sk-proj-YOUR_OPENAI_API_KEY_HERE') {
        try {
          parsedAction = await parseUserMessageWithAI(content, apiKey);
        } catch (aiError) {
          console.warn('AI parser failed, falling back to local parser:', aiError);
        }
      } else {
        console.info('OpenAI API key not configured, using local parser only');
      }

      if (!parsedAction) {
        // Fallback to local parsing logic
        const lowerContent = content.toLowerCase();

        if (lowerContent.includes('send') || lowerContent.includes('create') || lowerContent.includes('escrow')) {
          parsedAction = { type: 'create_escrow', recipients: [], amount: '0' };
        } else if (lowerContent.includes('bitcoin') && lowerContent.includes('address')) {
          parsedAction = { type: 'set_bitcoin_address', address: 'invalid' };
        } else if (lowerContent.includes('balance') || lowerContent.includes('principal')) {
          parsedAction = { type: 'query', query: 'all' };
        } else if (lowerContent.includes('approve') || lowerContent.includes('decline')) {
          parsedAction = { type: 'approval_suggestion' };
        }
      }

      if (parsedAction) {
        const response = generateActionResponse(parsedAction, {
          principal,
          icpBalance,
          ckbtcBalance,
          ckbtcAddress,
        });

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Handle navigation after a delay
        setTimeout(() => {
          if (parsedAction.type === 'create_escrow') {
            const navigation = handleEscrowCreation(parsedAction);
            executeNavigation(navigation);
          } else if (parsedAction.type === 'approval_suggestion') {
            const navigation = handleApprovalSuggestion(parsedAction);
            if (navigation.type === 'populate_form') {
              sessionStorage.setItem('splitsafe_show_approval_suggestions', 'true');
              window.dispatchEvent(new CustomEvent('refresh-approval-suggestions'));
            } else {
              executeNavigation(navigation);
            }
          } else if (parsedAction.type === 'set_bitcoin_address') {
            const navigation = handleBitcoinAddressSet(parsedAction);
            executeNavigation(navigation);
          }
        }, 1000);

        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I can help you with two main things:\n\n1. Create Escrows\n   Try: 'send 2 btc to [recipient-id]'\n\n2. Get Approval Advice\n   Try: 'should I approve or decline?'\n\nJust tell me what you need!",
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error && error.message.includes('API key')
          ? "I'm sorry, but the AI assistant is not configured. Please contact support to enable this feature."
          : "I'm sorry, but I encountered an error while processing your message. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [principal, icpBalance, ckbtcBalance, ckbtcAddress]);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      handleSendMessage(inputValue.trim());
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
    <div className="w-full h-full bg-[#222222] border border-[#FEB64D] rounded-[2%] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#303434]">
        <div className="flex items-center space-x-3">
          <BotMessageSquare className="w-5 h-5 text-[#FEB64D]" />
          <span className="text-white font-semibold">SplitSafe AI</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-white hover:bg-[#2a2a2a]"
        >
          <X size={20} />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FEB64D] to-[#F97415] flex items-center justify-center flex-shrink-0">
                    <BotMessageSquare className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[294px] rounded-xl p-4 ${
                    message.role === 'user'
                      ? 'bg-[#FEB64D] text-black ml-auto'
                      : 'bg-[#474747] text-white border border-[#636363]'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4A2BE1] to-[#7B5AFF] flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 text-white font-bold">U</div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FEB64D] to-[#F97415] flex items-center justify-center flex-shrink-0">
                  <BotMessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="bg-[#474747] text-white rounded-xl p-4 border border-[#636363]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Box */}
        <div className="flex-shrink-0 p-4">
          <form onSubmit={handleSubmit} className="bg-[#333333] border border-[#FEB64D] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Talk with SplitSafe AI"
                className="bg-transparent border-0 text-white placeholder-[#FFFFFF66] focus:outline-none focus:ring-0 flex-1"
                disabled={isLoading}
              />
              <div className="flex items-center space-x-2">
                <span className="text-white">|</span>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  disabled={!inputValue.trim() || isLoading}
                  className="text-[#FEB64D] hover:bg-transparent p-0"
                >
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
