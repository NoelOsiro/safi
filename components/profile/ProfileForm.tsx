import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Pencil, Save, User, Mail, Phone, Briefcase, MapPin, Award } from "lucide-react"
import { ProfileFormData } from "@/lib/types/profile.types"

interface ProfileFormProps {
  formData: ProfileFormData
  isEditing: boolean
  formLoading: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onEditClick: () => void
}

export function ProfileForm({
  formData,
  isEditing,
  formLoading,
  onInputChange,
  onSubmit,
  onCancel,
  onEditClick
}: ProfileFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
            onChange={onInputChange} 
            disabled={!isEditing}
            className={!isEditing ? "border-0 p-0 h-auto text-base font-medium" : ""}
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
            onChange={onInputChange} 
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
            onChange={onInputChange} 
            disabled={!isEditing}
            className={!isEditing ? "border-0 p-0 h-auto text-base" : ""}
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
            onChange={onInputChange}
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
            onChange={onInputChange} 
            disabled={!isEditing}
            className={!isEditing ? "border-0 p-0 h-auto text-base" : ""}
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
            onChange={onInputChange}
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

      {isEditing ? (
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={formLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={formLoading}>
            {formLoading ? (
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
      ) : (
        <div className="flex justify-end pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onEditClick}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>
        </div>
      )}
    </form>
  )
}
