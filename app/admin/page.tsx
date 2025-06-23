import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users, BookOpen, Award, TrendingUp, Download, Filter } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const stats = [
    { title: "Total Users", value: "2,847", change: "+12%", icon: Users },
    { title: "Active Learners", value: "1,923", change: "+8%", icon: BookOpen },
    { title: "Certifications", value: "456", change: "+23%", icon: Award },
    { title: "Completion Rate", value: "78%", change: "+5%", icon: TrendingUp },
  ]

  const recentUsers = [
    { name: "Mary Wanjiku", location: "Nairobi", progress: 85, status: "Active", type: "Vendor" },
    { name: "John Kiprotich", location: "Eldoret", progress: 92, status: "Certified", type: "School Kitchen" },
    { name: "Grace Achieng", location: "Kisumu", progress: 45, status: "Learning", type: "Catering" },
    { name: "Peter Mwangi", location: "Machakos", progress: 100, status: "Certified", type: "Vendor" },
    { name: "Sarah Njeri", location: "Nakuru", progress: 67, status: "Active", type: "Restaurant" },
  ]

  const regions = [
    { name: "Nairobi County", users: 1247, certified: 234, completion: 82 },
    { name: "Kisumu County", users: 456, certified: 89, completion: 76 },
    { name: "Eldoret County", users: 389, certified: 67, completion: 71 },
    { name: "Mombasa County", users: 298, certified: 45, completion: 68 },
    { name: "Machakos County", users: 234, certified: 21, completion: 65 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest users who have joined the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.location}</TableCell>
                        <TableCell>{user.type}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${user.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{user.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "Certified"
                                ? "default"
                                : user.status === "Active"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              user.status === "Certified"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : user.status === "Active"
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                  : ""
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
                <CardDescription>User engagement and certification rates by county</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>County</TableHead>
                      <TableHead>Total Users</TableHead>
                      <TableHead>Certified</TableHead>
                      <TableHead>Completion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regions.map((region, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{region.name}</TableCell>
                        <TableCell>{region.users.toLocaleString()}</TableCell>
                        <TableCell>{region.certified}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${region.completion}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{region.completion}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Modules</CardTitle>
                  <CardDescription>Manage course content and materials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">Module 1: Food Safety Basics</h4>
                      <p className="text-sm text-gray-600">Last updated: 2 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">Module 2: Hygiene & Cleanliness</h4>
                      <p className="text-sm text-gray-600">Last updated: 1 week ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">Module 3: Food Handling</h4>
                      <p className="text-sm text-gray-600">Last updated: 3 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Report</CardTitle>
                  <CardDescription>Generate comprehensive monthly analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-700">89%</div>
                        <div className="text-sm text-green-600">User Satisfaction</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-700">456</div>
                        <div className="text-sm text-blue-600">New Certifications</div>
                      </div>
                    </div>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact Metrics</CardTitle>
                  <CardDescription>Track the platform's impact on food safety</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Inspection Pass Rate</span>
                      <span className="font-bold text-green-600">+23%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Food Safety Incidents</span>
                      <span className="font-bold text-red-600">-15%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Community Reach</span>
                      <span className="font-bold text-blue-600">12,000+</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
