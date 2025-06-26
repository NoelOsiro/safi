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
import { Header } from "@/components/landing/header"

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
      <Header/>

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
