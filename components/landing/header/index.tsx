import Link from "next/link"

export function Header() {
  return (
    <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 animate-fade-in">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">MS</span>
          </div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
              MAMA SAFI
            </h1>
            <p className="text-xs text-emerald-600">AI Coach for Food Safety</p>
          </div>
        </div>
        <nav className="hidden md:flex space-x-8">
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
        </nav>
      </div>
    </header>
  )
}
