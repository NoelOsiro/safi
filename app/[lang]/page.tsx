import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, BookOpen, CheckCircle, Users, Globe, Award, Star, ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Hero } from "@/components/landing/hero"
import { Stats } from "@/components/landing/stats"
import { Footer } from "@/components/landing/footer"
import { CallToAction } from "@/components/landing/cta"
import { Testimonials } from "@/components/landing/testimonials"
import { FeaturesGrid } from "@/components/landing/features"
import { VisualLearning } from "@/components/landing/visual"
import { getDictionary } from '../dictionaries'
import { Curriculum } from "@/components/landing/curriculum"

type Params = {
  params: {
    lang: 'en' | 'sw'
  }
}


export default async function HomePage({ params }: Params) {
  const { lang } = params
  const dict = await getDictionary(lang)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 animate-fade-in">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">MS</span>
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                WinjoPro
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

      {/* Hero Section */}
      <Hero dict={dict} />

      {/* Stats Section */}
      <Stats dict={dict} />

      {/* Visual Learning Section with Random Images */}
      <VisualLearning dict={dict} />

      {/* Features Grid */}
      <FeaturesGrid dict={dict} />

      {/* Training Modules Preview with Random Images */}
      <Curriculum dictionary={dict} />

      {/* Testimonials with Random Images */}
      <Testimonials dict={dict} />

      {/* CTA Section */}
      <CallToAction dict={dict} />

      {/* Footer */}
      <Footer dict={dict} />
    </div>
  )
}
