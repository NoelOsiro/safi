import { User } from "./user.types"

export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  businessType: string;
  location: string;
  experience: string;
}

export interface ProfileHeaderProps {
  user: User | null;
  isEditing: boolean;
  onEditClick: () => void;
  onAvatarClick: () => void;
  userInitials: string;
}

export const getUserInitials = (name?: string, email?: string): string => {
  if (name) {
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return email ? email[0].toUpperCase() : 'U';
};
