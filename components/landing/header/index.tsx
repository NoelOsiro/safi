import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Session } from "@supabase/supabase-js";
import Link from "next/link";
import ProfileIcon from "./ProfileIcon";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return (
    <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {renderLogo()}
        {renderNav(session)}
      </div>
    </header>
  );
}

function renderLogo() {
  return <div className="flex items-center space-x-3 animate-fade-in">
    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
      <span className="text-white font-bold text-sm">WP</span>
    </div>
    <div>
      <h1 className="font-bold text-xl bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
        WinjoPro
      </h1>
      <p className="text-xs text-emerald-600">AI Coach for Food Safety</p>
    </div>
  </div>;
}

function renderNav(session: Session | null) {
  const links = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training", href: "/training" },
    { label: "Assessment", href: "/assessment" },
    { label: "Admin", href: "/admin" },
  ];
  return (
    <nav className="hidden md:flex space-x-8 items-center">
      {links.map((link, index) => (
        <Link
          href={link.href}
          id={`${link.label}-${index}`}
          key={index}
          className="text-slate-600 hover:text-emerald-600 transition-colors font-medium"
        >
          {link.label}
        </Link>
      ))}
      {session ? (
        <ProfileIcon session={session} />
      ) : (
        renderSignInBtn()
      )}
    </nav>
  );
}

function renderSignInBtn() {
  return <Button asChild variant="default" size="sm">
    <Link href="/login">Sign In</Link>
  </Button>;
}

