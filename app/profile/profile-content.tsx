// In profile-content.tsx
"use client"

import { useState } from "react"
import { ProfileForm } from "../../components/profile/ProfileForm"
import { User } from "@/lib/types/user.types" // Make sure to import your User type

interface ProfileContentProps {
  user: User
}

export function ProfileContent({ user }: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Map your user data to the form data structure
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    businessType: user.businessType || '',
    location: user.location || '',
    experience: user.experience || '',
    // Add other fields as needed
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      // Add your form submission logic here
      // await updateUserProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile', error)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="lg:col-span-2">
      <ProfileForm 
        formData={formData}
        isEditing={isEditing}
        formLoading={formLoading}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={() => setIsEditing(false)}
        onEditClick={() => setIsEditing(true)}
      />
    </div>
  )
}