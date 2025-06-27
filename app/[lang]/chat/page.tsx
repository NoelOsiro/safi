import { createClient, getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import ChatClient from "./chat-client"

export default async function ChatPage() {
  const { user, error: userError } = await getUser();
  
  if (!user || userError) {
    redirect('/login')
  }

  // Verify user is admin
  const { data: userData } = await (await createClient())
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    redirect('/')
  }

  const quickActions = [
    { text: "Learn about food safety", action: "learn", icon: "📚" },
    { text: "Assess your kitchen", action: "assess", icon: "📷" },
    { text: "Prepare for certification", action: "certification", icon: "🏆" },
    { text: "Start Module 1", action: "module1", icon: "▶️" },
  ]
  
  const chatUser = {
    name: user.user_metadata?.full_name || 'User',
    email: user.email || ''
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <ChatClient 
        quickActions={quickActions} 
        user={chatUser} 
      />
    </Suspense>
  )
}
