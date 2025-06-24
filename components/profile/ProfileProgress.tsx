interface Progress {
  modulesCompleted?: number
  totalModules?: number
}

interface ProfileProgressProps {
  progress?: Progress
  className?: string
}

export function ProfileProgress({ 
  progress,
  className = '' 
}: ProfileProgressProps) {
  const modulesCompleted = progress?.modulesCompleted ?? 0;
  const totalModules = progress?.totalModules ?? 1;
  const progressPercent = Math.round((modulesCompleted / totalModules) * 100)

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1 text-right">
        {modulesCompleted} of {totalModules} modules completed
      </p>
    </div>
  )
}
