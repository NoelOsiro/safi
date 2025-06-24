import { redirect } from 'next/navigation';
import { getLoggedInUser } from '@/lib/server/appwrite';
import LoginForm from './login-form';
import { signUpWithMicrosoft } from "@/lib/server/oauth";

export default async function LoginPage() {
  // Check if user is already logged in
  try {
    const user = await getLoggedInUser();
    console.log(user)
    if (user) {
      redirect('/dashboard');
    }
  } catch (error) {
    // User is not logged in, continue to show login form
    console.log('No active session, showing login form');
  }

  return <LoginForm signUpWithMicrosoft={signUpWithMicrosoft} />;
}