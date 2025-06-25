"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Globe } from "lucide-react"
import Link from "next/link"
import { useChat } from "ai/react"
import type { Session } from "@supabase/supabase-js"

interface ChatClientProps {
  quickActions: Array<{ text: string; action: string; icon: string }>
  user: { name: string; email: string }
  session: Session
}

export default function ChatClient({ quickActions, user, session }: ChatClientProps) {
  const [language, setLanguage] = useState("english")
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: getWelcomeMessage(language),
      },
    ],
  })

  function getWelcomeMessage(lang: string) {
    const messages = {
      english:
        "Karibu! I'm Mama Safi, your AI food safety coach. I can help you:\n\n• Learn about food safety basics\n• Assess your kitchen setup\n• Prepare for certification\n• Answer any food safety questions\n\nWhat would you like to start with today?",
      swahili:
        "Karibu sana! Mimi ni Mama Safi, mwalimu wako wa usalama wa chakula. Ninaweza kukusaidia:\n\n• Kujifunza msingi wa usalama wa chakula\n• Kutathmini jiko lako\n• Kujiandaa kwa cheti\n• Kujibu maswali yoyote ya usalama wa chakula\n\nUngependa kuanza na nini leo?",
      sheng:
        "Sasa! Mi ni Mama Safi, coach wako wa food safety. Naweza kukusaidia:\n\n• Kujua basics za food safety\n• Ku-check kitchen yako\n• Kujiandaa kwa certification\n• Kujibu any questions za food safety\n\nUnataka tuanze na nini?",
    }
    return messages[lang as keyof typeof messages] || messages.english
  }

  const handleQuickAction = (text: string) => {
    const event = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>
    const target = { value: text } as HTMLInputElement
    handleInputChange({ target } as React.ChangeEvent<HTMLInputElement>)
    handleSubmit(event)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <header className="bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild className="hover:bg-emerald-50">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <AvatarFallback className="text-white text-sm font-bold">MS</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-slate-800">Mama Safi AI Coach</h1>
                <div className="text-xs text-emerald-600 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                  Online • Ready to help
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white/80 rounded-lg px-3 py-2 shadow-sm">
            <Globe className="h-4 w-4 text-emerald-600" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm border-0 bg-transparent focus:outline-none text-slate-700"
            >
              <option value="english">English</option>
              <option value="swahili">Kiswahili</option>
              <option value="sheng">Sheng</option>
            </select>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-3 flex items-center space-x-2 overflow-hidden"
                    onClick={() => handleQuickAction(action.text)}
                  >
                    <span className="flex-shrink-0">{action.icon}</span>
                    <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                      {action.text}
                    </span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Modules Completed</span>
                      <span>2/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "40%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Assessment Score</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <Badge className="w-full justify-center bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Certification Ready: 80%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="h-[calc(100vh-200px)] bg-white rounded-lg shadow-md p-4 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
