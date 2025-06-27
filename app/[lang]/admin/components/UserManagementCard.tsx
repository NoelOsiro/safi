import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function UserManagementCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Coach Settings</CardTitle>
        <CardDescription>Configure chatbot responses and languages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Active Languages</label>
          <div className="flex space-x-2">
            <Badge>English</Badge>
            <Badge>Kiswahili</Badge>
            <Badge>Sheng</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Response Mode</label>
          <select className="w-full border rounded px-3 py-2">
            <option>Conversational</option>
            <option>Formal</option>
            <option>Educational</option>
          </select>
        </div>
        <Button className="w-full">Update Settings</Button>
      </CardContent>
    </Card>
  )
}
