'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { Download } from "lucide-react"
import { AdminHeader } from './components/AdminHeader'
import { UserManagementCard } from './components/UserManagementCard'
import { MetricsCard } from './components/MetricsCard'
import { UsersTable } from './components/UsersTable'
import { User, Role } from './types'
import { updateUserRole } from './actions'

interface AdminContentProps {
  initialUsers: User[]
  currentUserRole: Role
}

export function AdminContent({ initialUsers, currentUserRole }: AdminContentProps) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<Record<string, boolean>>({})

  const handleRefresh = async () => {
    try {
      setLoading(true)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      setUpdating(prev => ({ ...prev, [userId]: true }))
      
      await updateUserRole(userId, newRole)
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      toast.success('User role updated successfully')
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update user role')
    } finally {
      setUpdating(prev => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader loading={loading} onRefresh={handleRefresh} />

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* User Management Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">User Management</h2>
          <UserManagementCard />
          <UsersTable 
            users={users} 
            loading={loading} 
            updating={updating} 
            onRoleChange={handleRoleChange} 
            currentUserRole={currentUserRole}
          />
        </div>

        {/* Analytics Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <MetricsCard
              title="Monthly Report"
              description="Generate comprehensive monthly analytics"
              metrics={[
                { 
                  label: 'User Satisfaction', 
                  value: '89%',
                  color: 'bg-green-50',
                  description: 'Up from 77% last month'
                },
                { 
                  label: 'New Certifications', 
                  value: '456',
                  color: 'bg-blue-50',
                  description: '32% increase from last month'
                }
              ]}
              action={{
                label: 'Download Report',
                onClick: () => {},
                icon: <Download className="h-4 w-4 mr-2" />
              }}
            />

            <MetricsCard
              title="Impact Metrics"
              description="Track the platform's impact on food safety"
              metrics={[
                { 
                  label: 'Inspection Pass Rate', 
                  value: '+23%',
                  color: 'bg-green-50',
                  description: 'Improved from last quarter'
                },
                { 
                  label: 'Food Safety Incidents', 
                  value: '-15%',
                  color: 'bg-red-50',
                  description: 'Reduction in reported incidents'
                },
                { 
                  label: 'Community Reach', 
                  value: '12,000+',
                  color: 'bg-blue-50',
                  description: 'Active users this month'
                }
              ]}
              layout="list"
              action={{
                label: 'View Detailed Analytics',
                onClick: () => {},
                variant: 'outline'
              }}
            />
          </div>

          <MetricsCard
            title="User Engagement"
            description="Key metrics for user interaction and satisfaction"
            metrics={[
              { 
                label: 'User Satisfaction', 
                value: '92%',
                description: '+5% from last month',
                color: 'bg-green-50'
              },
              { 
                label: 'Active Users', 
                value: '1,245',
                description: 'Daily active users',
                color: 'bg-blue-50'
              },
              { 
                label: 'Avg. Session', 
                value: '12:34',
                description: 'Average session duration',
                color: 'bg-purple-50'
              },
              { 
                label: 'Completion Rate', 
                value: '78%',
                description: 'Course completion rate',
                color: 'bg-amber-50'
              }
            ]}
            layout="grid"
          />
        </div>
      </main>
    </div>
  )
}
