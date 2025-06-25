import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

type Module = {
  title: string
  icon: string
  description: string
  duration: string
  level: string
  imageId: number
}

export function Curriculum() {
  const modules: Module[] = [
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
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Complete Training Curriculum</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Five comprehensive modules designed specifically for Kenyan food vendors and kitchens
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
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
                <CardDescription className="text-slate-600 leading-relaxed">
                  {module.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
