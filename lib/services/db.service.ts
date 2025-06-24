import { databases, ID, appwriteConfig } from '../appwrite';

export interface Assessment {
  userId: string;
  type: string;
  answers: Record<string, any>;
  score?: number;
  completedAt?: Date;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: Date;
}

export const dbService = {
  // User Operations
  async createUser(userData: Omit<User, 'createdAt'>) {
    try {
      return await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        ID.unique(),
        {
          ...userData,
          userId: ID.unique(),
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async getUser(userId: string) {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [`userId=${userId}`, 'limit=1']
      );
      return response.documents[0] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Assessment Operations
  async createAssessment(assessmentData: Omit<Assessment, 'completedAt'>) {
    try {
      return await databases.createDocument(
        appwriteConfig.databaseId,
        'assessments',
        ID.unique(),
        {
          ...assessmentData,
          completedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  },

  async getUserAssessments(userId: string) {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'assessments',
        [`userId=${userId}`, 'orderDesc=completedAt']
      );
      return response.documents;
    } catch (error) {
      console.error('Error getting user assessments:', error);
      return [];
    }
  },

  // Generic Document Operations
  async createDocument(collection: string, data: any) {
    try {
      return await databases.createDocument(
        appwriteConfig.databaseId,
        collection,
        ID.unique(),
        {
          ...data,
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  },

  async getDocument(collection: string, documentId: string) {
    try {
      return await databases.getDocument(
        appwriteConfig.databaseId,
        collection,
        documentId
      );
    } catch (error) {
      console.error(`Error getting document from ${collection}:`, error);
      return null;
    }
  },

  async updateDocument(collection: string, documentId: string, data: any) {
    try {
      return await databases.updateDocument(
        appwriteConfig.databaseId,
        collection,
        documentId,
        data
      );
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  },

  async deleteDocument(collection: string, documentId: string) {
    try {
      return await databases.deleteDocument(
        appwriteConfig.databaseId,
        collection,
        documentId
      );
    } catch (error) {
      console.error(`Error deleting document from ${collection}:`, error);
      throw error;
    }
  },

  // List documents with optional filters
  async listDocuments(
    collection: string,
    queries: string[] = [],
    limit: number = 25,
    offset: number = 0
  ) {
    try {
      return await databases.listDocuments(
        appwriteConfig.databaseId,
        collection,
        [
          ...queries,
          `limit(${limit})`,
          `offset(${offset})`
        ]
      );
    } catch (error) {
      console.error(`Error listing documents from ${collection}:`, error);
      return { documents: [], total: 0 };
    }
  },
};
