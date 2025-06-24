import { Client, Account, Databases, ID, type Models } from 'appwrite';

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Initialize the Appwrite services
const account = new Account(client);
const databases = new Databases(client);

// Database and collection IDs
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'safi_db';
const COLLECTION_USERS = 'users';

// Types
export interface UserDocument extends Models.Document {
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

// Database service
export const dbService = {
  // User operations
  async getUserByEmail(email: string): Promise<UserDocument | null> {
    try {
      const response = await databases.listDocuments<UserDocument>(
        DATABASE_ID,
        COLLECTION_USERS,
        [
          `email=${email}`,
          'limit=1'
        ]
      );
      
      return response.documents[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  async createUser(userData: Omit<UserDocument, keyof Models.Document | '$collectionId' | '$databaseId'>) {
    try {
      return await databases.createDocument<UserDocument>(
        DATABASE_ID,
        COLLECTION_USERS,
        ID.unique(),
        userData
      );
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(userId: string, updates: Partial<UserDocument>) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_USERS,
        userId,
        updates
      );
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
};

// Export the Appwrite instances and utilities
export { client, account, databases, ID };

export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: DATABASE_ID,
  usersCollectionId: COLLECTION_USERS,
};
