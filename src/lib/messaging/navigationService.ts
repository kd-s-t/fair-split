import { EscrowCreateAction, ApprovalSuggestionAction, BitcoinAddressSetAction } from './actionParser';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export interface NavigationAction {
  type: 'redirect' | 'populate_form';
  path: string;
  data?: Record<string, unknown>;
}

// Global router reference
let router: AppRouterInstance | null = null;

export function setRouter(r: AppRouterInstance) {
  router = r;
}

export function handleEscrowCreation(action: EscrowCreateAction): NavigationAction {
  return {
    type: 'redirect',
    path: '/escrow',
    data: {
      amount: action.amount,
      recipients: action.recipients
    }
  };
}

export function handleBitcoinAddressSet(action: BitcoinAddressSetAction): NavigationAction {
  return {
    type: 'redirect',
    path: '/integrations',
    data: {
      bitcoinAddress: action.address,
      autoSet: true
    }
  };
}

export function handleApprovalSuggestion(_action: ApprovalSuggestionAction): NavigationAction { // eslint-disable-line @typescript-eslint/no-unused-vars
  // Check if user is already on transactions page
  if (typeof window !== 'undefined' && window.location.pathname === '/transactions') {
    return {
      type: 'populate_form',
      path: '/transactions',
      data: { show_approval_suggestions: true }
    };
  }
  
  return {
    type: 'redirect',
    path: '/transactions'
  };
}

export function executeNavigation(navigation: NavigationAction): void {
  // Store data in sessionStorage for form population
  if (navigation.data) {
    sessionStorage.setItem('splitsafe_chat_data', JSON.stringify(navigation.data));
  }
  
  // Navigate to the specified path
  if (router) {
    router.push(navigation.path);
  } else {
    // Fallback to window.location.href
    window.location.href = navigation.path;
  }
} 