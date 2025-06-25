import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, CheckCircle, BookOpen, Users, Globe } from "lucide-react"

interface FeaturesGridProps {
  dict: {
    landing: {
      features: {
        title: string
        subtitle: string
        aiTitle: string
        aiDescription: string
        certificationPrep: string
        certificationPrepDescription: string
        interactiveModules: string
        interactiveModulesDescription: string
        smartAssessment: string
        smartAssessmentDescription: string
        communitySupport: string
        communitySupportDescription: string
        multiPlatformAccess: string
        multiPlatformAccessDescription: string
      }
    }
  }
}

export function FeaturesGrid({ dict }: FeaturesGridProps) {
  
  const gradientClasses = [
    "from-emerald-500 to-teal-500",
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-indigo-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-violet-500 to-fuchsia-500"
  ]
  
  const icons = [
    <CheckCircle key="check" className="h-6 w-6 text-white" />,
    <CheckCircle key="check2" className="h-6 w-6 text-white" />,
    <CheckCircle key="check3" className="h-6 w-6 text-white" />,
    <CheckCircle key="check4" className="h-6 w-6 text-white" />,
    <CheckCircle key="check5" className="h-6 w-6 text-white" />,
    <CheckCircle key="check6" className="h-6 w-6 text-white" />
  ]

  const features = [
    {
      title: dict.landing.features.aiTitle,
      icon: <CheckCircle className="h-8 w-8 text-white" />,
      description: dict.landing.features.aiDescription,
      gradient: "from-blue-500 to-cyan-500",
      textColor: "text-blue-800"
    },
    {
      title: dict.landing.features.interactiveModules,
      icon: <BookOpen className="h-8 w-8 text-white" />,
      description: dict.landing.features.interactiveModulesDescription,
      gradient: "from-blue-500 to-cyan-500",
      textColor: "text-blue-800"
    },
    {
      title: dict.landing.features.smartAssessment,
      icon: <CheckCircle className="h-8 w-8 text-white" />,
      description: dict.landing.features.smartAssessmentDescription,
      gradient: "from-purple-500 to-pink-500",
      textColor: "text-purple-800"
    },
    {
      title: dict.landing.features.certificationPrep,
      icon: <Award className="h-8 w-8 text-white" />,
      description: dict.landing.features.certificationPrepDescription,
      gradient: "from-orange-500 to-amber-500",
      textColor: "text-orange-800"
    },
    {
      title: dict.landing.features.communitySupport,
      icon: <Users className="h-8 w-8 text-white" />,
      description: dict.landing.features.communitySupportDescription,
      gradient: "from-rose-500 to-red-500",
      textColor: "text-rose-800"
    },
    {
      title: dict.landing.features.multiPlatformAccess,
      icon: <Globe className="h-8 w-8 text-white" />,
      description: dict.landing.features.multiPlatformAccessDescription,
      gradient: "from-teal-500 to-emerald-500",
      textColor: "text-teal-800"
    }
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">{dict.landing.features.title}</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {dict.landing.features.subtitle}
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
