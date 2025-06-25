import Link from "next/link"
import { Dictionary } from "@/app/dictionaries"

interface FooterProps {
  dict: Dictionary
}

export function Footer({ dict }: FooterProps) {
  const { company, platform, support, legal, copyright } = dict.landing.footer
  
  return (
    <footer className="bg-slate-900 text-white py-16 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {company.name.substring(0, 2)}
                </span>
              </div>
              <h3 className="font-bold text-xl">{company.name}</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {company.description}
            </p>
          </div>

          {/* Platform Links */}
          <div className="animate-fade-in-up delay-100">
            <h4 className="font-semibold mb-4 text-emerald-400">
              {platform.title}
            </h4>
            <ul className="space-y-3 text-slate-400">
              {platform.items.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="animate-fade-in-up delay-200">
            <h4 className="font-semibold mb-4 text-emerald-400">
              {support.title}
            </h4>
            <ul className="space-y-3 text-slate-400">
              {support.items.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Language Selector */}
          <div className="animate-fade-in-up delay-300">
            <h4 className="font-semibold mb-4 text-emerald-400">
              {legal.title}
            </h4>
            <ul className="space-y-3 text-slate-400">
              {legal.items.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-4">
                <h5 className="font-semibold mb-2 text-emerald-400">Languages</h5>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <span>🇬🇧</span>
                    <Link href="/en" className="hover:text-emerald-400 transition-colors">
                      English
                    </Link>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>🇰🇪</span>
                    <Link href="/sw" className="hover:text-emerald-400 transition-colors">
                      Swahili
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
          {copyright}
        </div>
      </div>
    </footer>
  )
}

