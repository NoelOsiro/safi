import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageCircle, CheckCircle } from "lucide-react"
import { Dictionary } from "@/app/dictionaries"

interface CallToActionProps {
  dict: Dictionary
}

export function CallToAction({ dict }: CallToActionProps) {
  const { title, subtitle, startButton, assessmentButton } = dict.landing.cta
  
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto text-center relative z-10">
        <div className="animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
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
                {startButton}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/assessment">
                <CheckCircle className="mr-2 h-5 w-5" />
                {assessmentButton}
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
  )
}
