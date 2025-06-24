import { User as AuthUser } from '@/lib/services/auth.service';
import { User } from '@/lib/types/user.types';

// Helper type to make all properties optional and nullable
type PartialWithNull<T> = {
  [P in keyof T]?: T[P] | null;
};

/**
 * Converts an auth service User to our application's User type
 */
export function adaptAuthUserToAppUser(authUser: AuthUser | null | undefined): User | null {
  if (!authUser) return null;
  
  // Safely access avatar from user or prefs
  const avatar = 'avatar' in authUser ? authUser.avatar : 
                authUser.prefs && 'avatar' in authUser.prefs ? authUser.prefs.avatar : undefined;
  
  const phone = 'phone' in authUser ? authUser.phone : undefined;
  
  return {
    $id: authUser.$id,
    name: authUser.name,
    email: authUser.email,
    emailVerified: 'emailVerification' in authUser ? authUser.emailVerification : undefined,
    image: avatar,
    avatar: avatar,
    phone: phone || undefined, // Convert empty string to undefined
    businessType: authUser.prefs?.businessType || undefined,
    location: authUser.prefs?.location || undefined,
    experience: authUser.prefs?.experience || undefined,
    role: authUser.role,
    onboardingCompleted: authUser.prefs?.onboardingCompleted,
    progress: authUser.prefs?.progress,
    $createdAt: authUser.$createdAt,
    $updatedAt: authUser.$updatedAt,
    prefs: authUser.prefs
  };
}

/**
 * Prepares user data for update by converting from our User type to the auth service's expected format
 */
export function prepareUserForUpdate(userData: Partial<User>): Partial<AuthUser> {
  const { $id, $createdAt, $updatedAt, prefs, role, ...rest } = userData;
  
  // Ensure role is one of the allowed values if provided
  const safeRole = role === 'admin' || role === 'user' ? role : undefined;
  
  return {
    ...rest,
    ...(safeRole && { role: safeRole }),
    prefs: {
      ...prefs,
      ...(userData.businessType !== undefined && { businessType: userData.businessType }),
      ...(userData.location !== undefined && { location: userData.location }),
      ...(userData.experience !== undefined && { experience: userData.experience }),
      ...(userData.progress !== undefined && { progress: userData.progress }),
      ...(userData.onboardingCompleted !== undefined && { 
        onboardingCompleted: userData.onboardingCompleted 
      })
    }
  };
}
