import { Dictionary } from "@/app/dictionaries"

interface StatsProps {
  dict: {
    landing: {
      stats: {
        title: string
        subtitle: string
        vendorTrained: string
        countiesCovered: string
        passRateIncrease: string
        languagesSupported: string
      }
    }
  }
}

export function Stats({ dict }: StatsProps) {
  return (
    <section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {dict.landing.stats.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {dict.landing.stats.subtitle}
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="animate-fade-in-up">
            <div className="text-4xl font-bold text-emerald-600 mb-2">1,200+</div>
            <p className="text-slate-600">{dict.landing.stats.vendorTrained}</p>
          </div>
          <div className="animate-fade-in-up delay-100">
            <div className="text-4xl font-bold text-teal-600 mb-2">24/47</div>
            <p className="text-slate-600">{dict.landing.stats.countiesCovered}</p>
          </div>
          <div className="animate-fade-in-up delay-200">
            <div className="text-4xl font-bold text-cyan-600 mb-2">85%</div>
            <p className="text-slate-600">{dict.landing.stats.passRateIncrease}</p>
          </div>
          <div className="animate-fade-in-up delay-300">
            <div className="text-4xl font-bold text-emerald-600 mb-2">2+</div>
            <p className="text-slate-600">{dict.landing.stats.languagesSupported}</p>
          </div>
        </div>
      </div>
    </section>
  )
}