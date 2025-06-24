import LoginPage from "./page";
import { getLoggedInUser } from "@/lib/server/appwrite";

export default async function LoginPageWrapper() {
  // This runs on the server
  const user = await getLoggedInUser().catch(() => null);
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  // Otherwise, render the client component
  return <LoginPage />;
}
