"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  level: string;
  image: string;
  progress?: number;
  status?: "completed" | "in-progress" | "not-started";
}

interface ModuleCardProps {
  module: Module;
  href: string;
}

export function ModuleCard({ module, href }: ModuleCardProps) {
  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/chat?module=${module.id}`;
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow group overflow-hidden p-6"
      data-testid="module-card"
    >
      <div className="relative">
        <CardHeader className="p-0">
          <Link href={href} className="block w-full h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-1 items-start space-x-4">
                <div className="text-3xl">{module.icon}</div>
                <div>
                  <CardTitle className="text-lg">
                    Module {module.id}: {module.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {module.description}
                  </CardDescription>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge
                      variant={
                        module.status === "completed"
                          ? "default"
                          : module.status === "in-progress"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        module.status === "completed"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : module.status === "in-progress"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          : ""
                      }
                    >
                      {module.status === "completed"
                        ? "Completed"
                        : module.status === "in-progress"
                        ? "In Progress"
                        : "Not Started"}
                    </Badge>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {module.duration}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right m-auto sm:text-left">
                <div className="text-xl font-bold text-gray-900">
                  {module.progress ?? 0}%
                </div>
                <Progress
                  value={module.progress}
                  className="w-full sm:w-24 mt-1"
                />
              </div>
            </div>
          </Link>
        </CardHeader>

        <CardContent className="p-6 pt-2 mt-4">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-between">
            {module.status === "completed" && (
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Review
              </Button>
            )}
            {module.status === "in-progress" && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <BookOpen className="h-4 w-4 mr-2" />
                Continue
              </Button>
            )}
            {module.status === "not-started" && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <BookOpen className="h-4 w-4 mr-2" />
                Start Module
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleChatClick}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask AI
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
