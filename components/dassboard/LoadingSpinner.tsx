import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  fullScreen?: boolean
}

export function LoadingSpinner({ fullScreen = false }: LoadingSpinnerProps) {
  return (
    <div 
      className={`flex items-center justify-center ${
        fullScreen ? 'min-h-screen' : 'min-h-[60vh]'
      }`}
      data-testid="loading-spinner"
    >
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  )
}
