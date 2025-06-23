"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, ArrowLeft, Globe, Mic } from "lucide-react"
import Link from "next/link"
import { useChat } from "ai/react"

export default function ChatPage() {
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

  const quickActions = [
    { text: "Learn about food safety", action: "learn", icon: "📚" },
    { text: "Assess your kitchen", action: "assess", icon: "📷" },
    { text: "Prepare for certification", action: "certification", icon: "🏆" },
    { text: "Start Module 1", action: "module1", icon: "▶️" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
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

          {/* Language Selector */}
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

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Quick Actions Sidebar */}
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
                    className="w-full text-left justify-start h-auto p-3 flex items-center space-x-2"
                    onClick={() => {
                      const event = { preventDefault: () => {} } as any
                      handleInputChange({ target: { value: action.text } } as any)
                      handleSubmit(event)
                    }}
                  >
                    <span className="text-sm">{action.icon}</span>
                    <span className="text-sm">{action.text}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Progress Card */}
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

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Chat with Mama Safi</CardTitle>
                  <Badge variant="secondary">AI Coach</Badge>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your message... (Andika ujumbe wako...)"
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon">
                    <Mic className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                  Mama Safi speaks English, Kiswahili, and Sheng. Ask anything about food safety!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
