'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { ChatInterface, Message } from './ChatInterface';
import { saveMessages, loadMessages, clearMessages } from '@/lib/messaging/storage';
import { generateActionResponse } from '@/lib/messaging/actionParser';
import { parseUserMessageWithAI } from '@/lib/messaging/aiParser';
import { handleEscrowCreation, handleApprovalSuggestion, handleBitcoinAddressSet, executeNavigation, setRouter } from '@/lib/messaging/navigationService';
import { getGlobalChatState, clearGlobalChatMessages } from '@/lib/messaging/chatState';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/store';
import { RootState } from '@/lib/redux/store';
import { ParsedAction } from '@/lib/messaging/actionParser';

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function RightSidebar({ isOpen, onToggle }: RightSidebarProps) {
  const router = useRouter();
  const principal = useAppSelector((state: RootState) => state.user.principal);
  const icpBalance = useAppSelector((state: RootState) => state.user.icpBalance);
  const ckbtcBalance = useAppSelector((state: RootState) => state.user.ckbtcBalance);
  const ckbtcAddress = useAppSelector((state: RootState) => state.user.ckbtcAddress);
  
  const [messages, setMessages] = React.useState<Message[]>(() => {
    const globalState = getGlobalChatState();
    if (globalState.messages.length > 0) {
      return globalState.messages;
    }
    const savedMessages = loadMessages();
    return savedMessages;
  });
  const [isLoading, setIsLoading] = React.useState(false);

  // Set router for navigation service
  React.useEffect(() => {
    setRouter(router);
  }, [router]);

  // Load messages from localStorage on component mount
  React.useEffect(() => {
    const globalState = getGlobalChatState();
    if (globalState.messages.length === 0) {
      const savedMessages = loadMessages();
      if (savedMessages.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome',
          content: "Hello! I'm your SplitSafe Assistant. I can help you with four things:\n\n1. Create Escrows\n   Just tell me who you want to send money to and how much\n\n2. Set Bitcoin Address\n   Tell me your Bitcoin address and I'll set it for you\n\n3. Account Queries\n   Ask me about your principal, balances, or Bitcoin address\n\n4. Get Approval Advice\n   I'll help you decide whether to approve or decline received escrows\n\nJust chat naturally - I'll understand what you need!",
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
  React.useEffect(() => {
    saveMessages(messages);
    const globalState = getGlobalChatState();
    globalState.messages = messages;
  }, [messages]);

  const handleSendMessage = React.useCallback(async (content: string) => {
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
      
      if (apiKey) {
        try {
          parsedAction = await parseUserMessageWithAI(content, apiKey);
        } catch (aiError) {
          console.warn('AI parser failed, falling back to local parser:', aiError);
        }
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
        content: "I can help you with four things:\n\n1. Create Escrows\n   Try: 'send 2 btc to [recipient-id]'\n\n2. Set Bitcoin Address\n   Try: 'set my bitcoin address to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'\n\n3. Account Queries\n   Try: 'what is my principal?' or 'show my ICP balance'\n\n4. Approval Advice\n   Try: 'should I approve or decline?'\n\nJust tell me what you need!",
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

  const handleClearChat = () => {
    clearMessages();
    clearGlobalChatMessages();
    const welcomeMessage: Message = {
      id: 'welcome',
      content: "Hello! I'm your SplitSafe Assistant. I can help you with four things:\n\n1. Create Escrows\n   Just tell me who you want to send money to and how much\n\n2. Set Bitcoin Address\n   Tell me your Bitcoin address and I'll set it for you\n\n3. Account Queries\n   Ask me about your principal, balances, or Bitcoin address\n\n4. Get Approval Advice\n   I'll help you decide whether to approve or decline received escrows\n\nJust chat naturally - I'll understand what you need!",
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed right-4 top-20 z-50 bg-[#222222] border-[#303434] text-white hover:bg-[#303434]"
      >
        {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>



      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="h-screen w-80 bg-[#222222] border-l border-[#303434] z-40 shadow-2xl"
          >
            <div className="flex flex-col h-full p-4 space-y-4">
              {/* AI Chat Interface - Full Space */}
              <div className="flex-1 flex flex-col bg-[#1a1a1a] border border-[#303434] rounded-lg min-h-0">
                <div className="flex items-center justify-between p-3 border-b border-[#303434] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">AI</span>
                    </div>
                    <span className="text-sm font-medium text-white">SplitSafe Assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0">
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onClearChat={handleClearChat}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
