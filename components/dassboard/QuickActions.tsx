import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, BookOpen } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <div className="mt-4 grid md:grid-cols-2 gap-6">
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Ready for Assessment?</CardTitle>
          <CardDescription>Test your knowledge with our comprehensive food safety assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full bg-green-600 hover:bg-green-700">
            <Link href="/assessment">
              <CheckCircle className="h-4 w-4 mr-2" />
              Take Assessment
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Need Help?</CardTitle>
          <CardDescription>Chat with WinjoPro AI Coach for personalized guidance</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
            <Link href="/chat">
              <BookOpen className="h-4 w-4 mr-2" />
              Chat with AI Coach
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
