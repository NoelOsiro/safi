import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import ChatClient from "./chat-client"

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const quickActions = [
    { text: "Learn about food safety", action: "learn", icon: "📚" },
    { text: "Assess your kitchen", action: "assess", icon: "📷" },
    { text: "Prepare for certification", action: "certification", icon: "🏆" },
    { text: "Start Module 1", action: "module1", icon: "▶️" },
  ]
  
  const user = {
    name: session.user?.user_metadata?.full_name || 'User',
    email: session.user?.email || ''
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <ChatClient 
        quickActions={quickActions} 
        user={user} 
        session={session}
      />
    </Suspense>
  )
}
