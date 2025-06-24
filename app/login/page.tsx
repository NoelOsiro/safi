import { redirect } from 'next/navigation';
import { getLoggedInUser } from '@/lib/server/appwrite';
import LoginForm from './login-form';
import { signUpWithMicrosoft } from "@/lib/server/oauth";

export default async function LoginPage() {
  // Check if user is already logged in
  return <LoginForm signUpWithMicrosoft={signUpWithMicrosoft} />;
}