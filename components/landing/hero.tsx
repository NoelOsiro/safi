import { Badge,  MessageCircle, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dictionary } from "@/app/dictionaries";
import Link from "next/link";

interface HeroProps {
  dict: {
    landing: {
      hero: {
        title: string;
        tagline: string;
        description: string;
        madeInKenya: string;
        startAITraining: string;
        watchDemo: string;
        trustedBy: string;
        stats: Array<{
          value: string;
          label: string;
        }>;
      };
    };
  };
}

export function Hero({ dict }: HeroProps) {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-teal-100/20"></div>
      <div className="container mx-auto text-center relative z-10">
        <div className="animate-fade-in-up">
          <Badge className="mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 hover:from-emerald-200 hover:to-teal-200 transition-all duration-300 px-4 py-2 text-sm font-medium">
            🇰🇪 {dict.landing.hero.madeInKenya}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-transparent mb-6 animate-fade-in-up delay-100">
            {dict.landing.hero.title}
          </h1>
          <p className="text-2xl md:text-3xl text-slate-700 mb-4 animate-fade-in-up delay-200">
            {dict.landing.hero.tagline}
          </p>
          <p className="text-lg text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            {dict.landing.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
          <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/auth/signup" className="text-white hover:text-white">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Start AI Training
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/training/module-1" className="text-emerald-700 hover:text-emerald-800">
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
  );
}