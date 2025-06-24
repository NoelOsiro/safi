"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Upload, X } from "lucide-react"
import { ExperienceBadge } from "@/components/profile/ExperienceBadge"
import { ProfileProgress } from "@/components/profile/ProfileProgress"
import { ProfileForm } from "@/components/profile/ProfileForm"
import { ProfileFormData } from "@/lib/types/profile.types"
import { User } from "@/lib/types/user.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Utility function to get user initials
export const getUserInitials = (name?: string, email?: string): string => {
  if (name) {
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return email ? email[0].toUpperCase() : 'U';
}

// Helper to safely get user data
const getSafeUserData = (user: User | null) => ({
  name: user?.name || '',
  email: user?.email || '',
  phone: user?.phone || '',
  businessType: user?.businessType || '',
  location: user?.location || '',
  experience: user?.experience || ''
});

// Form validation function
const validateForm = (data: ProfileFormData) => {
  const errors: Partial<Record<keyof ProfileFormData, string>> = {};
  
  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default function ProfilePage() {
  const { user, error, isLoading: isUserLoading } = useAuthStore();
  const { updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    location: '',
    experience: ''
  });
  
  // Initialize form data and avatar preview when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        businessType: user.businessType || '',
        location: user.location || '',
        experience: user.experience || ''
      });
      
      // Set avatar preview if available
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);
  
  // Calculate user initials
  const userInitials = user ? getUserInitials(user.name, user.email) : 'U';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validate form
    const { isValid, errors } = validateForm(formData);
    setFormErrors(errors);
    
    if (!isValid) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }
    
    setFormLoading(true);
    
    try {
      // Handle avatar upload if a new file was selected
      let avatarUrl = user.avatar;
      if (avatarFile) {
        setIsAvatarUploading(true);
        // In a real app, you would upload the file to your server here
        // For now, we'll just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        avatarUrl = URL.createObjectURL(avatarFile);
      }
      
      // Update user data in the store
      if (user.id) {
        await updateUser(user.id, {
          ...formData,
          avatar: avatarUrl,
          progress: user.progress || { modulesCompleted: 0, totalModules: 0 }
        });
      }
      
      // Clear the file input
      setAvatarFile(null);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setFormLoading(false);
      setIsAvatarUploading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        businessType: user.businessType || '',
        location: user.location || '',
        experience: user.experience || ''
      });
    }
  };

  const handleAvatarClick = () => {
    document.getElementById('avatar-upload')?.click();
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };
  
  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    // In a real app, you would also remove the avatar from the server
  };

  // Calculate progress percentage
  const calculateProgress = (user: User) => {
    // Ensure we have valid progress data
    const modulesCompleted = user.progress?.modulesCompleted ?? 0;
    const totalModules = user.progress?.totalModules ?? 1;
    return Math.round((modulesCompleted / totalModules) * 100);
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading user data</h2>
          <p className="text-gray-600 mb-4">Please try again later</p>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress(user);

  // No need to check status here as useCurrentUser already handles loading and auth state

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Card */}
        <div className="w-full md:w-1/3">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="relative group">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600">
                      {userInitials}
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={handleAvatarClick}
                      >
                        <Upload className="h-4 w-4" />
                        <span className="sr-only">Upload avatar</span>
                      </Button>
                      {avatarPreview && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          className="text-white hover:bg-white/20 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAvatar();
                          }}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove avatar</span>
                        </Button>
                      )}
                      <Input
                        id="avatar-upload"
                        name="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={isAvatarUploading}
                      />
                    </div>
                  )}
                </div>
                {isAvatarUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <div className="text-center mt-4">
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>
              
              <div className="w-full pt-4 border-t mt-4">
                <ExperienceBadge experience={user.experience || undefined} className="mb-2" />
                <ProfileProgress 
                  progress={{
                    modulesCompleted: user.progress?.modulesCompleted,
                    totalModules: user.progress?.totalModules
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="flex-1">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b">
              <div>
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <p className="text-sm text-gray-500">Update your account's profile information and email address.</p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ProfileForm 
                formData={formData}
                isEditing={isEditing}
                formLoading={formLoading}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                onEditClick={() => setIsEditing(true)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
