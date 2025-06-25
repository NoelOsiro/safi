export default function Stats() {
    return (
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
    );
}