"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { ChatButton } from './ChatButton';
import { ChatInterface, Message } from './ChatInterface';
import { saveMessages, loadMessages, clearMessages } from '@/lib/messaging/storage';
import { generateActionResponse } from '@/lib/messaging/actionParser';
import { parseUserMessageWithAI } from '@/lib/messaging/aiParser';
import { handleEscrowCreation, handleApprovalSuggestion, handleBitcoinAddressSet, executeNavigation, setRouter } from '@/lib/messaging/navigationService';
import { getGlobalChatState, updateGlobalChatOpen, clearGlobalChatMessages } from '@/lib/messaging/chatState';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/store';
import { RootState } from '@/lib/redux/store';
import { ParsedAction } from '@/lib/messaging/actionParser';

export function MessagingSystem() {
  const router = useRouter();
  const principal = useAppSelector((state: RootState) => state.user.principal);
  const icpBalance = useAppSelector((state: RootState) => state.user.icpBalance);
  const btcBalance = useAppSelector((state: RootState) => state.user.btcBalance);
  const btcAddress = useAppSelector((state: RootState) => state.user.btcAddress);
  
  // Set router for navigation service
  useEffect(() => {
    setRouter(router);
  }, [router]);
  
  const [isOpen, setIsOpen] = useState(() => getGlobalChatState().isOpen);
  const [messages, setMessages] = useState<Message[]>(() => {
    const globalState = getGlobalChatState();
    if (globalState.messages.length > 0) {
      return globalState.messages;
    }
    // Load from localStorage if no global state
    const savedMessages = loadMessages();
    return savedMessages;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const globalState = getGlobalChatState();
    if (globalState.messages.length === 0) {
      const savedMessages = loadMessages();
      if (savedMessages.length === 0) {
        // Add welcome message for new users
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
  useEffect(() => {
    saveMessages(messages);
    // Update global state
    const globalState = getGlobalChatState();
    globalState.messages = messages;
  }, [messages]);

  // Update global state when isOpen changes
  useEffect(() => {
    updateGlobalChatOpen(isOpen);
  }, [isOpen]);

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
      // Get API key from environment variable
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      let parsedAction: ParsedAction = null;
      
      if (apiKey) {
        try {
          // Use AI to understand the message and determine action
          parsedAction = await parseUserMessageWithAI(content, apiKey);
        } catch (aiError) {
          console.warn('AI parser failed, falling back to local parser:', aiError);
        }
      }
      
      // If AI parser failed or no API key, try local parser
      if (!parsedAction) {
        const { parseUserMessage } = await import('@/lib/messaging/actionParser');
        parsedAction = parseUserMessage(content);
      }
      
      if (parsedAction) {
        // Handle specific actions
        const response = generateActionResponse(parsedAction, {
          principal,
          icpBalance,
          btcBalance,
          btcAddress,
        });
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // Execute navigation after a short delay
        setTimeout(() => {
          if (parsedAction.type === 'create_escrow') {
            const navigation = handleEscrowCreation(parsedAction);
            executeNavigation(navigation);
            // Keep chat open during navigation
            setIsOpen(true);
          } else if (parsedAction.type === 'approval_suggestion') {
            const navigation = handleApprovalSuggestion(parsedAction);
            
            // If user is already on transactions page, just trigger suggestions
            if (navigation.type === 'populate_form') {
              console.log('Triggering approval suggestions...');
              sessionStorage.setItem('splitsafe_show_approval_suggestions', 'true');
              // Trigger a custom event to refresh the page
              window.dispatchEvent(new CustomEvent('refresh-approval-suggestions'));
              console.log('Approval suggestions event dispatched');
            } else {
              executeNavigation(navigation);
            }
            
            // Keep chat open during navigation
            setIsOpen(true);
          } else if (parsedAction.type === 'set_bitcoin_address') {
            const navigation = handleBitcoinAddressSet(parsedAction);
            executeNavigation(navigation);
            // Keep chat open during navigation
            setIsOpen(true);
          }
        }, 1000); // 1 second delay to show the response
        
        return;
      }

      // If no action was detected, provide helpful guidance
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
  }, [principal, icpBalance, btcBalance, btcAddress]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

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

  // Don't render if user is not authenticated
  if (!principal) {
    return null;
  }

  return (
    <>
      <ChatButton 
        isOpen={isOpen} 
        onToggle={handleToggle}
        unreadCount={0} // You can implement unread count logic here
      />
      <ChatInterface
        isOpen={isOpen}
        onClose={handleClose}
        messages={messages}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        isLoading={isLoading}
      />
    </>
  );
} 