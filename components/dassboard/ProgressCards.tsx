import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, CheckCircle, Clock, Award } from "lucide-react"

interface ProgressCardsProps {
  overallProgress: number
  completedModules: number
  totalModules: number
}

export function ProgressCards({ 
  overallProgress, 
  completedModules, 
  totalModules 
}: ProgressCardsProps) {
  const remainingModules = totalModules - completedModules

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overallProgress}%</div>
          <Progress value={overallProgress} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedModules}/{totalModules}</div>
          <p className="text-xs text-muted-foreground">
            {remainingModules} module{remainingModules !== 1 ? 's' : ''} remaining
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2.5h</div>
          <p className="text-xs text-muted-foreground">This week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Certification Ready</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">75%</div>
          <p className="text-xs text-muted-foreground">Almost there!</p>
        </CardContent>
      </Card>
    </div>
  )
}
