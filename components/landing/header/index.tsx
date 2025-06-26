import { Avatar,  AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/server"
import { LogOut, Settings, User } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
async function logout() {
  "use server"; // <-- required for server action
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
export async function Header() {
  const supabase = await createClient()
   const {
      data: { session },
    } = await supabase.auth.getSession();
  return (
    <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 animate-fade-in">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">WP</span>
          </div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
              WinjoPro
            </h1>
            <p className="text-xs text-emerald-600">AI Coach for Food Safety</p>
          </div>
        </div>
        <nav className="hidden md:flex space-x-8 items-center">
          <Link href="/dashboard" className="text-slate-600 hover:text-emerald-600 transition-colors font-medium">
            Dashboard
          </Link>
          <Link href="/training" className="text-slate-600 hover:text-emerald-600 transition-colors font-medium">
            Training
          </Link>
          <Link href="/assessment" className="text-slate-600 hover:text-emerald-600 transition-colors font-medium">
            Assessment
          </Link>
          <Link href="/admin" className="text-slate-600 hover:text-emerald-600 transition-colors font-medium">
            Admin
          </Link>
          {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          session?.user.user_metadata?.avatar_url ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`
                        }
                        alt={session.user.user_metadata?.name || session.user.email}
                      />
                      <AvatarFallback>
                        {session.user.user_metadata?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.user_metadata?.name || session.user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
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
                      <button type="submit" className="flex items-center w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/login" >Sign In</Link>
              </Button>
            )}
        </nav>
      </div>
    </header>
  )
}
