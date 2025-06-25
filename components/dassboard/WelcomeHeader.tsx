import type { User } from "@/lib/types/user.types";
import { createClient } from "@/lib/supabase/server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
interface WelcomeHeaderProps {
  user: User | null;
}

// ✅ Must be marked as a server action
export async function logout() {
  "use server"; // <-- required for server action
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name || "User"}
        </h1>
        <p className="text-muted-foreground">
          Track your learning progress and access your courses
        </p>
      </div>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild aria-label="User menu">
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
                  }
                  alt={user.name || user.email}
                />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.name || user.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={logout} method="post">
                <button type="submit" className="flex items-center w-full" data-testid="logout-button">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          asChild
          variant="default"
          size="sm"
          className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
        >
          <Link href="/login">Sign In</Link>
        </Button>
      )}
    </div>
  );
}
