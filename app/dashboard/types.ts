export interface Module {
  id: string
  title: string
  description: string
  icon: string
  duration: string
  level: string
  image: string
  progress?: number
  status?: 'completed' | 'in-progress' | 'not-started'
}

export interface ApiResponse {
  success: boolean
  modules: Module[]
}

export interface User {
  id: string
  name: string
  email: string
  // Add other user properties as needed
}
