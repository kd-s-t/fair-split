import { EscrowCreateAction, ApprovalSuggestionAction, BitcoinAddressSetAction, NavigationAction as ParsedNavigationAction } from './actionParser';
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
      recipients: action.recipients,
      title: action.title
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

export function handleNavigation(action: ParsedNavigationAction): NavigationAction {
  const pathMap: Record<string, string> = {
    'dashboard': '/dashboard',
    'escrow': '/escrow',
    'transactions': '/transactions',
    'integrations': '/integrations',
    'settings': '/settings'
  };
  
  const path = pathMap[action.destination] || '/dashboard';
  
  return {
    type: 'redirect',
    path
  };
}

export function executeNavigation(navigation: NavigationAction): void {
  if (navigation.data) {
    sessionStorage.setItem('splitsafe_chat_data', JSON.stringify(navigation.data));
  }
  
  if (router) {
    router.push(navigation.path);
  } else {
    window.location.href = navigation.path;
  }
} 