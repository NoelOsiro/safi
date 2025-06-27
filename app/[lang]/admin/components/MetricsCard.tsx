import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface MetricItem {
  label: string
  value: string | number
  description?: string
  color?: string
  icon?: React.ReactNode
}

interface MetricsCardProps {
  title: string
  description: string
  metrics: MetricItem[]
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
    variant?: "default" | "outline"
  }
  layout?: 'grid' | 'list'
}

export function MetricsCard({ 
  title, 
  description, 
  metrics, 
  action,
  layout = 'grid' 
}: MetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={layout === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
            {metrics.map((metric, index) => (
              <div 
                key={index}
                className={`p-4 ${metric.color || 'bg-gray-50'} rounded`}
              >
                <div className="flex items-center space-x-2">
                  {metric.icon && <span>{metric.icon}</span>}
                  <div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="text-sm">{metric.label}</div>
                    {metric.description && (
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {action && (
            <Button 
              className="w-full" 
              variant={action.variant || 'default'}
              onClick={action.onClick}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
