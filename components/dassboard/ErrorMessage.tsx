'use client'
import { Button } from "@/components/ui/button"

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="text-center my-12">
      <p className="text-red-500 mb-4">{message}</p>
      <Button onClick={onRetry || (() => window.location.reload())}>
        Try Again
      </Button>
    </div>
  )
}
