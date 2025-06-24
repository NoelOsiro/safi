import { Award } from "lucide-react"

interface ExperienceBadgeProps {
  experience?: string
  className?: string
}

export function ExperienceBadge({ experience, className = '' }: ExperienceBadgeProps) {
  const getExperienceLevel = (level?: string) => {
    if (!level) return 'Beginner';
    const levels: Record<string, string> = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'experienced': 'Experienced',
      'expert': 'Expert'
    };
    return levels[level.toLowerCase()] || level;
  };

  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`}>
      <Award className="h-4 w-4 text-emerald-500" />
      <span>Food Safety Level: {getExperienceLevel(experience)}</span>
    </div>
  )
}
