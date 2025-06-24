import LoginPage from "./page";
import { getLoggedInUser } from "@/lib/server/appwrite";

export default async function LoginPageWrapper() {
  return <LoginPage />;
}
