import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, BookOpen, CheckCircle, Users, Globe, Award, Star, ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Hero from "@/components/landing/hero"
import Stats from "@/components/landing/stats"
import { Footer } from "@/components/landing/footer"
import { CallToAction } from "@/components/landing/cta"
import { Testimonials } from "@/components/landing/testimonials"
import { FeaturesGrid } from "@/components/landing/features"
import VisualLearning from "@/components/landing/visual"

export default function HomePage() {
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

      {/* Hero Section */}
      <Hero />

      {/* Stats Section */}
      <Stats />

      {/* Visual Learning Section with Random Images */}
      <VisualLearning />

      {/* Features Grid */}
      <FeaturesGrid/>

      {/* Training Modules Preview with Random Images */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Complete Training Curriculum</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Five comprehensive modules designed specifically for Kenyan food vendors and kitchens
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Introduction to Food Safety",
                icon: "🍽️",
                description: "Understanding food safety basics and why it matters for your business",
                duration: "15 min",
                level: "Beginner",
                imageId: 2,
              },
              {
                title: "Hygiene & Cleanliness",
                icon: "🧼",
                description: "Personal hygiene practices and proper cleaning procedures",
                duration: "20 min",
                level: "Beginner",
                imageId: 3,
              },
              {
                title: "Food Handling & Storage",
                icon: "🥩",
                description: "Safe storage temperatures and proper handling techniques",
                duration: "25 min",
                level: "Intermediate",
                imageId: 4,
              },
              {
                title: "Kitchen Setup & Safety",
                icon: "🏠",
                description: "Optimal kitchen layout and waste management systems",
                duration: "18 min",
                level: "Intermediate",
                imageId: 5,
              },
              {
                title: "Certification Requirements",
                icon: "📝",
                description: "Documents needed and inspection preparation strategies",
                duration: "22 min",
                level: "Advanced",
                imageId: 6,
              },
            ].map((module, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <Image
                    src={`https://picsum.photos/300/200?random=${module.imageId}`}
                    alt={module.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-slate-700">{module.level}</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      {module.duration}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl">{module.icon}</div>
                    <div>
                      <CardTitle className="text-lg text-slate-800">Module {index + 1}</CardTitle>
                      <p className="text-sm text-slate-600">{module.title}</p>
                    </div>
                  </div>
                  <CardDescription className="text-slate-600 leading-relaxed">{module.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials with Random Images */}
      <Testimonials />

      {/* CTA Section */}
      <CallToAction />

      {/* Footer */}
      <Footer />
    </div>
  )
}
