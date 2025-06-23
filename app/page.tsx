import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, BookOpen, CheckCircle, Users, Globe, Award, Star, ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-teal-100/20"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <Badge className="mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 hover:from-emerald-200 hover:to-teal-200 transition-all duration-300 px-4 py-2 text-sm font-medium">
              🇰🇪 Made for Kenya with ❤️
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-transparent mb-6 animate-fade-in-up delay-100">
              MAMA SAFI
            </h1>
            <p className="text-2xl md:text-3xl text-slate-700 mb-4 animate-fade-in-up delay-200">
              AI Coach for Food Safety in Kenya
            </p>
            <p className="text-lg text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
              "Smart training for safer food, from your kitchen to the community." Prepare for food safety certification
              through accessible, AI-assisted learning that speaks your language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/auth/signup">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Start AI Training
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/training/module-1">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-60 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full opacity-40 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-br from-teal-200 to-emerald-200 rounded-full opacity-50 animate-float-slow"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in-up">
              <div className="text-4xl font-bold text-emerald-600 mb-2">10,000+</div>
              <p className="text-slate-600">Vendors Trained</p>
            </div>
            <div className="animate-fade-in-up delay-100">
              <div className="text-4xl font-bold text-teal-600 mb-2">5</div>
              <p className="text-slate-600">Counties Covered</p>
            </div>
            <div className="animate-fade-in-up delay-200">
              <div className="text-4xl font-bold text-cyan-600 mb-2">78%</div>
              <p className="text-slate-600">Pass Rate Increase</p>
            </div>
            <div className="animate-fade-in-up delay-300">
              <div className="text-4xl font-bold text-emerald-600 mb-2">3</div>
              <p className="text-slate-600">Languages Supported</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Learning Section with Random Images */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-left">
              <h2 className="text-4xl font-bold text-slate-800 mb-6">Learn Through Visual Stories</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our AI coach uses real kitchen scenarios and visual examples to make food safety concepts easy to
                understand and remember.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-slate-700">Interactive photo-based learning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-slate-700">Real kitchen scenarios from Kenya</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-slate-700">Step-by-step visual guides</span>
                </div>
              </div>
            </div>
            <div className="animate-fade-in-right">
              <div className="relative">
                <Image
                  src="https://picsum.photos/600/400?random=1"
                  alt="Kenyan kitchen food safety training"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-medium">Real kitchen training scenarios</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Powerful Features for Food Safety</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to master food safety and get certified, powered by AI
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-emerald-50 to-teal-50 animate-fade-in-up">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-emerald-800 mb-3">AI Coach</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Chat-based assistant in Swahili, English & Sheng guiding you through training with personalized
                  support
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-cyan-50 animate-fade-in-up delay-100">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-800 mb-3">Interactive Modules</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Short audio-visual courses covering hygiene, storage, and certification prep with hands-on activities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-pink-50 animate-fade-in-up delay-200">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-purple-800 mb-3">Smart Assessment</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  AI-powered photo analysis and quizzes to evaluate your kitchen and prepare for certification
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-orange-50 to-amber-50 animate-fade-in-up delay-300">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-orange-800 mb-3">Certification Prep</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Mock tests and real inspection scenarios with performance tips to ensure you pass on the first try
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-rose-50 to-red-50 animate-fade-in-up delay-400">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-rose-800 mb-3">Community Support</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Connect with trainers, NGOs, and health officers for ongoing support and group learning
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-teal-50 to-emerald-50 animate-fade-in-up delay-500">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-teal-800 mb-3">Multi-Platform Access</CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Available on WhatsApp, web, and mobile app for maximum accessibility across all devices
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

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
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Success Stories</h2>
            <p className="text-xl text-slate-600">Hear from vendors who transformed their businesses with Mama Safi</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Mary Wanjiku",
                role: "Street Food Vendor, Nairobi",
                quote: "Mama Safi helped me understand food safety in Kiswahili. Now my customers trust my food more!",
                rating: 5,
                imageId: 7,
              },
              {
                name: "John Kiprotich",
                role: "School Kitchen Manager, Eldoret",
                quote: "The AI coach made learning easy. We passed our health inspection on the first try!",
                rating: 5,
                imageId: 8,
              },
              {
                name: "Grace Achieng",
                role: "Catering Business Owner, Kisumu",
                quote: "The photo assessment feature helped me identify problems I never noticed before.",
                rating: 5,
                imageId: 9,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-emerald-50 animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader className="p-8 text-center">
                  <Image
                    src={`https://picsum.photos/80/80?random=${testimonial.imageId}`}
                    alt={testimonial.name}
                    width={80}
                    height={80}
                    className="w-16 h-16 rounded-full mx-auto mb-4 shadow-lg object-cover"
                  />
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-slate-700 italic mb-4 text-lg leading-relaxed">
                    "{testimonial.quote}"
                  </CardDescription>
                  <CardTitle className="text-slate-800 text-lg">{testimonial.name}</CardTitle>
                  <p className="text-slate-600 text-sm">{testimonial.role}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Kitchen?</h2>
            <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Join thousands of vendors and schools improving food safety across Kenya. Start your journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/auth/signup">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Start Free Training
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/assessment">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Take Quick Assessment
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-24 h-24 border border-white rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-white rounded-full animate-pulse delay-2000"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="animate-fade-in-up">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MS</span>
                </div>
                <h3 className="font-bold text-xl">MAMA SAFI</h3>
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
            <p>{"©"} 2024 MAMA SAFI. Building safer food systems across Kenya with love and technology.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
