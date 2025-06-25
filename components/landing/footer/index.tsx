import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <h3 className="font-bold text-xl">WinjoPro</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              AI-powered food safety training for a healthier Kenya. Building safer food systems one kitchen at a
              time.
            </p>
          </div>
          <div className="animate-fade-in-up delay-100">
            <h4 className="font-semibold mb-4 text-emerald-400">Platform</h4>
            <ul className="space-y-3 text-slate-400">
              <li>
                <Link href="/training" className="hover:text-emerald-400 transition-colors">
                  Training Modules
                </Link>
              </li>
              <li>
                <Link href="/assessment" className="hover:text-emerald-400 transition-colors">
                  Assessment Tools
                </Link>
              </li>
              <li>
                <Link href="/certification" className="hover:text-emerald-400 transition-colors">
                  Certification Prep
                </Link>
              </li>
            </ul>
          </div>
          <div className="animate-fade-in-up delay-200">
            <h4 className="font-semibold mb-4 text-emerald-400">Support</h4>
            <ul className="space-y-3 text-slate-400">
              <li>
                <Link href="/help" className="hover:text-emerald-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/whatsapp" className="hover:text-emerald-400 transition-colors">
                  WhatsApp Support
                </Link>
              </li>
            </ul>
          </div>
          <div className="animate-fade-in-up delay-300">
            <h4 className="font-semibold mb-4 text-emerald-400">Languages</h4>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-center space-x-2">
                <span>🇬🇧</span>
                <span>English</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>🇰🇪</span>
                <span>Kiswahili</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>🗣️</span>
                <span>Sheng</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
          <p>{"©"} {new Date().getFullYear()} WinjoPro. Building safer food systems across Kenya with love and technology.</p>
        </div>
      </div>
    </footer>
  )
}
