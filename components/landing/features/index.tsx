import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, BookOpen, CheckCircle, Users, Globe, Award } from "lucide-react"

export function FeaturesGrid() {
  const features = [
    {
      title: "AI Coach",
      icon: <MessageCircle className="h-8 w-8 text-white" />,
      description: "Chat-based assistant in Swahili, English & Sheng guiding you through training with personalized support",
      gradient: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-800"
    },
    {
      title: "Interactive Modules",
      icon: <BookOpen className="h-8 w-8 text-white" />,
      description: "Short audio-visual courses covering hygiene, storage, and certification prep with hands-on activities",
      gradient: "from-blue-500 to-cyan-500",
      textColor: "text-blue-800"
    },
    {
      title: "Smart Assessment",
      icon: <CheckCircle className="h-8 w-8 text-white" />,
      description: "AI-powered photo analysis and quizzes to evaluate your kitchen and prepare for certification",
      gradient: "from-purple-500 to-pink-500",
      textColor: "text-purple-800"
    },
    {
      title: "Certification Prep",
      icon: <Award className="h-8 w-8 text-white" />,
      description: "Mock tests and real inspection scenarios with performance tips to ensure you pass on the first try",
      gradient: "from-orange-500 to-amber-500",
      textColor: "text-orange-800"
    },
    {
      title: "Community Support",
      icon: <Users className="h-8 w-8 text-white" />,
      description: "Connect with trainers, NGOs, and health officers for ongoing support and group learning",
      gradient: "from-rose-500 to-red-500",
      textColor: "text-rose-800"
    },
    {
      title: "Multi-Platform Access",
      icon: <Globe className="h-8 w-8 text-white" />,
      description: "Available on WhatsApp, web, and mobile app for maximum accessibility across all devices",
      gradient: "from-teal-500 to-emerald-500",
      textColor: "text-teal-800"
    }
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Powerful Features for Food Safety</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to master food safety and get certified, powered by AI
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br ${index % 6 === 0 ? 'from-emerald-50 to-teal-50' : 
                index % 6 === 1 ? 'from-blue-50 to-cyan-50' : 
                index % 6 === 2 ? 'from-purple-50 to-pink-50' :
                index % 6 === 3 ? 'from-orange-50 to-amber-50' :
                index % 6 === 4 ? 'from-rose-50 to-red-50' : 'from-teal-50 to-emerald-50'} animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="text-center p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <CardTitle className={`text-xl ${feature.textColor} mb-3`}>
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-slate-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
