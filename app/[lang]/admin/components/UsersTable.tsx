import { Shield, GraduationCap,  UserIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { Role } from '../types'

const roleIcons = {
  admin: <Shield className="h-4 w-4" />,
  instructor: <GraduationCap className="h-4 w-4" />,
  student: <UserIcon className="h-4 w-4" />
}

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  instructor: 'bg-blue-100 text-blue-800',
  student: 'bg-green-100 text-green-800'
}

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'instructor' | 'student'
  created_at: string
}

interface UsersTableProps {
  users: any[]
  loading: boolean
  updating: Record<string, boolean>
  currentUserRole: Role
  onRoleChange: (userId: string, newRole: Role) => Promise<void>
}

export function UsersTable({ users, loading, updating, currentUserRole, onRoleChange }: UsersTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (users.length === 0) {
    return <div className="text-center p-8 text-muted-foreground">No users found</div>
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium">{user.name || 'No name'}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Select
                  value={user.role}
                  onValueChange={(value) => onRoleChange(user.id, value as Role)}
                  disabled={updating[user.id] || currentUserRole !== 'admin'}
                >
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <span className={`${roleColors[user.role as Role]} px-2 py-1 rounded-full text-xs flex items-center`}>
                        {roleIcons[user.role as Role]}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="instructor">
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Instructor
                      </div>
                    </SelectItem>
                    <SelectItem value="student">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Student
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
