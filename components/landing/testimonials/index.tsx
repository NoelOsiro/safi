import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Star } from "lucide-react"
import { Dictionary } from "@/app/dictionaries"

interface TestimonialsProps {
  dict: Dictionary
}

type Testimonial = {
  name: string
  role: string
  quote: string
  rating: number
  imageId: number
}

export function Testimonials({ dict }: TestimonialsProps) {
  const { title, subtitle, testimonials } = dict.landing.testimonials

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">{title}</h2>
          <p className="text-xl text-slate-600">{subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
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
  )
}
