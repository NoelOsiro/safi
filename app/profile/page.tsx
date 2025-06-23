"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Pencil, Save, User, Mail, Phone, Briefcase, MapPin, Award } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"

// Utility functions
const getExperienceLevel = (level?: string) => {
  if (!level) return 'Beginner';
  const levels: Record<string, string> = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'experienced': 'Experienced',
    'expert': 'Expert'
  };
  return levels[level] || 'Beginner';
};

const calculateProgress = (user: any) => {
  if (!user?.progress) return 0;
  const { modulesCompleted = 0, totalModules = 1 } = user.progress;
  return Math.round((modulesCompleted / totalModules) * 100);
};

interface ProfileFormData {
  name: string
  email: string
  phone: string
  businessType: string
  location: string
  experience: string
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { user, updateProgress } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    location: '',
    experience: ''
  })

  // Initialize form data from auth store
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.fullName || session?.user?.name || '',
        email: user.email || session?.user?.email || '',
        phone: user.phone || '',
        businessType: user.businessType || '',
        location: user.location || '',
        experience: user.experience || ''
      })
    }
  }, [user, session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update auth store
      updateProgress({
        // Update any relevant progress data if needed
      })
      
      // Update NextAuth session
      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: formData.name,
            email: formData.email,
            image: user?.avatar
          }
        })
      }
      
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const userInitials = user?.fullName 
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : session?.user?.name
      ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U'

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Card */}
        <div className="w-full md:w-1/3">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage 
                      src={(user?.avatar || session?.user?.image) ?? ''} 
                      alt={(user?.fullName || session?.user?.name) ?? 'User'} 
                    />
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-400 text-2xl text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 bg-white"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <input type="file" id="avatar-upload" className="hidden" accept="image/*" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">{user?.fullName || session?.user?.name || 'User'}</h2>
                  <p className="text-sm text-gray-500">{user?.email || session?.user?.email || ''}</p>
                </div>
                <div className="w-full pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <Award className="h-4 w-4 text-emerald-500" />
                    <span>Food Safety Level: {getExperienceLevel(user?.experience)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${calculateProgress(user)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {user?.progress?.modulesCompleted || 0} of {user?.progress?.totalModules || 0} modules completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="flex-1">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account's profile information and email address.</CardDescription>
                </div>
                {!isEditing ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-gray-500" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-gray-500" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-gray-500" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType" className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                      Business Type
                    </Label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${!isEditing ? 'bg-gray-50' : ''}`}
                    >
                      <option value="">Select business type</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="catering">Catering</option>
                      <option value="hotel">Hotel</option>
                      <option value="bakery">Bakery</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-500" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-gray-500" />
                      Experience Level
                    </Label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${!isEditing ? 'bg-gray-50' : ''}`}
                    >
                      <option value="">Select experience level</option>
                      <option value="beginner">Beginner (0-1 year)</option>
                      <option value="intermediate">Intermediate (1-3 years)</option>
                      <option value="experienced">Experienced (3-5 years)</option>
                      <option value="expert">Expert (5+ years)</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false)
                        // Reset form data
                        setFormData({
                          name: session?.user?.name || '',
                          email: session?.user?.email || '',
                          phone: '',
                          businessType: '',
                          location: '',
                          experience: ''
                        })
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
