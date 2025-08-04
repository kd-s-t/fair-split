export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  principalId: string;
  onNameSaved?: () => void;
}

export interface ProfileDropdownProps {
  user: {
    principalId: string | null;
    name?: string;
  };
}

export interface LogoutButtonProps {
  onLogout?: () => void;
}
