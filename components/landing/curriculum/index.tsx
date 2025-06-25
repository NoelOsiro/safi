import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Dictionary } from "@/app/dictionaries";
import { Clock, BookOpen, Award } from "lucide-react";

interface Module {
  title: string;
  description: string;
  duration: string;
  level: string;
}

interface CurriculumProps {
  dictionary: {
    landing: {
      curriculum: {
        title: string;
        subtitle: string;
        modules: Module[];
        levels: {
          beginner: string;
          intermediate: string;
          advanced: string;
        };
      };
    };
  };
}

export function Curriculum({ dictionary }: CurriculumProps) {
  const { title, subtitle, modules, levels } = dictionary.landing.curriculum;

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <Card
              key={index}
              data-testid="module-card"
              className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                <Image
                  src={`https://picsum.photos/300/200?random=${index}`}
                  alt={module.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-slate-700">
                    {module.level}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800"
                  >
                    {module.duration}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {module.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{module.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{module.duration}</span>
                      <Badge variant="outline" className="ml-3">
                        {module.level === "beginner"
                          ? levels.beginner
                          : module.level === "intermediate"
                          ? levels.intermediate
                          : levels.advanced}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
