export type Role = 'admin' | 'instructor' | 'student'

export interface User {
  id: string
  email: string
  full_name: string
  role: Role
  created_at: string
}

export const roleIcons = {
  admin: 'Shield',
  instructor: 'GraduationCap',
  student: 'User'
}

export const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  instructor: 'bg-blue-100 text-blue-800',
  student: 'bg-green-100 text-green-800'
}

export const roleLabels = {
  admin: 'Admin',
  instructor: 'Instructor',
  student: 'Student'
}
