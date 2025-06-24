// src/lib/server/appwrite.js
"use server";
import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

  const session = (await cookies()).get(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.toLowerCase()}_legacy`);
  if (!session || !session.value) {
    throw new Error("No session");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string)
    .setKey(process.env.APPWRITE_API_KEY as string);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function getLoggedInUser() {
  try {
    let error: string | null = null;
    const { account } = await createSessionClient();
    const user = await account.get();
    // Ensure we have a valid user object
    if (user && user.$id) {
      return { user, error };
    }
    return { user: null, error };
  } catch (error) {
    return { user: null, error };
  }
}

export async function logout() {
  try {
    
    const { account } = await createSessionClient();
    // Get current session first
    try {
      await account.getSession('current');
      // If we get here, session exists, so delete it
      await account.deleteSession('current');
    } catch (error) {
      // Session doesn't exist or already deleted, which is fine
      console.log('No active session to delete');
    }
    
    // Clear the session cookie by setting an expired cookie
    // Note: In server actions, we'll handle cookie clearing in the route handler
    // as we can't directly set cookies in server components
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error };
  }
}
