export interface Progress {
  modulesCompleted?: number;
  totalModules?: number;
}

import { Models } from 'appwrite';

export type User = {
  // Required fields
  $id: string;
  name: string;
  email: string;
  
  // Optional fields with Appwrite defaults
  $createdAt?: string;
  $updatedAt?: string;
  prefs?: Models.Preferences;
  
  // Our custom fields
  role?: 'admin' | 'user' | string;
  emailVerified?: boolean;
  image?: string;
  avatar?: string;
  phone?: string | null;
  businessType?: string | null;
  location?: string | null;
  experience?: string | null;
  progress?: Progress;
  onboardingCompleted?: boolean;
  
  // Allow any other string keys
  [key: string]: any;
};

// Create a base interface that matches the User type but makes all fields optional
type PartialUser = Partial<Omit<User, 'id'>> & {
  id: string;
  name: string;
  email: string;
};

export interface AppUser extends PartialUser {
  phone?: string;
  avatar?: string;
  image?: string; // For compatibility with auth providers that use 'image' instead of 'avatar'
  businessType?: string;
  location?: string;
  experience?: string;
  progress?: Progress;
}

export function isAppUser(user: any): user is AppUser {
  return (
    user !== null &&
    typeof user === 'object' &&
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string'
  );
}

export function createSafeAppUser(
  user: any,
  sessionUser?: Partial<AppUser> & { id?: string | null }
): AppUser | null {
  if (!user && !sessionUser) return null;
  
  const baseUser = user || {};
  const session = sessionUser || {};
  
  return {
    id: baseUser.id || session.id || '',
    name: baseUser.name || session.name || 'Guest User',
    email: baseUser.email || session.email || '',
    phone: baseUser.phone || '',
    businessType: baseUser.businessType || '',
    location: baseUser.location || '',
    experience: baseUser.experience || '',
    // Use avatar from either source, with priority to baseUser
    avatar: baseUser.avatar || session.avatar || session.image,
    progress: baseUser.progress || { modulesCompleted: 0, totalModules: 0 },
    // Include image for backward compatibility
    image: baseUser.image || session.image || session.avatar
  };
}

export function validateAppUser(user: unknown): AppUser {
  if (!user) throw new Error('User is required');
  if (typeof user !== 'object') throw new Error('User must be an object');
  
  const userObj = user as Record<string, unknown>;
  
  if (!userObj.id || typeof userObj.id !== 'string') throw new Error('User ID is required');
  if (!userObj.name || typeof userObj.name !== 'string') throw new Error('User name is required');
  if (!userObj.email || typeof userObj.email !== 'string') throw new Error('User email is required');
  
  return user as AppUser;
}
