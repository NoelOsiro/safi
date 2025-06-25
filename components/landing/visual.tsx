import { CheckCircle } from "lucide-react"
import Image from "next/image"

interface VisualLearningProps {
  dict: {
    landing: {
      visual: {
        learnThroughVisualStories: string
        realKitchenScenariosAndVisualExamples: string
        interactivePhotoBasedLearning: string
        realKitchenScenariosFromKenya: string
        stepByStepVisualGuides: string
        realKitchenTrainingScenarios: string
      }
    }
  }
}

export function VisualLearning({ dict }: VisualLearningProps) {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in-left">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              {dict.landing.visual.learnThroughVisualStories}
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              {dict.landing.visual.realKitchenScenariosAndVisualExamples}
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-slate-700">
                  {dict.landing.visual.interactivePhotoBasedLearning}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-slate-700">
                  {dict.landing.visual.realKitchenScenariosFromKenya}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-slate-700">
                  {dict.landing.visual.stepByStepVisualGuides}
                </span>
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
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-medium">
                  {dict.landing.visual.realKitchenTrainingScenarios}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}