import { Client, Account, type Models, OAuthProvider } from 'appwrite';
import { dbService } from './db.service';
import type { User } from '@/lib/types/user.types';
import { client, account } from '@/lib/appwrite';

class AuthService {
  private static instance: AuthService;
  private static account: Account;

  private constructor() {
    AuthService.account = account;
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async signInWithMicrosoft(redirectUrl: string = '') {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Microsoft sign-in is only supported on the client side');
      }
  
      // Use the current origin if no redirect URL is provided
      const baseUrl = redirectUrl || window.location.origin;
      const successUrl = `${baseUrl}/api/auth/callback`;
      const failureUrl = `${baseUrl}/login`;
  
      const scopes = ['openid', 'email', 'profile', 'offline_access'];
  
      // Start the OAuth2 flow
      account.createOAuth2Token(
        OAuthProvider.Microsoft,
        successUrl,
        failureUrl,
        scopes
      );
      return { success: true };
    } catch (error) {
      console.error('Microsoft sign-in error:', error);
      throw error;
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      // First check if we have a session
      try {
        await account.getSession('current');
      } catch (error) {
        // No active session
        return null;
      }
      
      // Get the current user from Appwrite
      const accountDetails = await account.get();
      
      if (!accountDetails) return null;
      
      // Map Appwrite user to your User type
      return {
        $id: accountDetails.$id,
        email: accountDetails.email,
        name: accountDetails.name || '',
        $createdAt: accountDetails.$createdAt,
        $updatedAt: accountDetails.$updatedAt,
        prefs: accountDetails.prefs as Models.Preferences,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  public async signOut(): Promise<void> {
    try {
      // Delete the current session
      await account.deleteSession('current');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }


  public onAuthStateChange(callback: (user: User | null) => void) {
    // Set up Appwrite account change listener
    const unsubscribe = client.subscribe('account', (response) => {
      if (response.events.includes('users.*.sessions.*.create')) {
        // User signed in
        this.getCurrentUser().then(callback).catch(console.error);
      } else if (response.events.includes('users.*.sessions.*.delete')) {
        // User signed out
        callback(null);
      }
    });

    // Return cleanup function
    return () => {
      unsubscribe();
    };
  }
}

// Export a singleton instance of AuthService
const authService = AuthService.getInstance();
export default authService;

