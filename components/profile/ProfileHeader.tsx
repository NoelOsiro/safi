import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { ProfileHeaderProps } from "@/lib/types/profile.types"

export function ProfileHeader({ 
  user, 
  isEditing, 
  onEditClick, 
  onAvatarClick,
  userInitials 
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24 mb-2">
          <AvatarImage 
          data-testid="user-avatar"
            src={user?.avatar || ''} 
            alt={user?.name || 'User'} 
          />
          <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-400 text-2xl text-white">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        {isEditing && (
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 bg-white"
            onClick={onAvatarClick}
          >
            <Pencil className="h-3.5 w-3.5" />
            <input type="file" id="avatar-upload" className="hidden" accept="image/*" />
          </Button>
        )}
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{user?.name || 'User'}</h2>
        <p className="text-sm text-gray-500">{user?.email || ''}</p>
      </div>
    </div>
  )
}
