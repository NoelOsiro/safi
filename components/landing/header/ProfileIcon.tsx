
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { User } from "@supabase/supabase-js";
import { User as UserIcon, Settings, LogOut } from "lucide-react";
import { logout } from "@/app/actions/authActions";
import Link from "next/link";
interface Props {
  user: User;
}

const ProfileIcon = ({ user }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                user.user_metadata?.avatar_url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
              }
              alt={user.user_metadata?.full_name || user.email}
            />
            <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-400 text-2xl text-white">
              {user.user_metadata?.full_name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.full_name || user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 p-0">
          <Link href="/profile" className="flex items-center w-full px-2 py-1.5 text-gray-900 hover:text-gray-900">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 p-0">
          <Link href="/dashboard" className="flex items-center w-full px-2 py-1.5 text-gray-900 hover:text-gray-900">
            <Settings className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 p-0">
          <form method="post" className="w-full">
            <button formAction={logout as any} type="submit" className="flex items-center w-full px-2 py-1.5 text-left text-gray-900 hover:text-gray-900">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileIcon;
