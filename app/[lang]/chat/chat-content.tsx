"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function ChatContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI Food Safety Coach. I'm here to help you with any questions about food safety, hygiene practices, or training modules. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputMessage),
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("temperature") || input.includes("cooking")) {
      return "Great question about cooking temperatures! Here are the key safe minimum internal temperatures:\n\n• Poultry (chicken, turkey): 165°F (74°C)\n• Ground meat: 160°F (71°C)\n• Whole cuts of beef, pork, lamb: 145°F (63°C)\n• Fish and shellfish: 145°F (63°C)\n\nAlways use a food thermometer to check temperatures. Would you like to know more about any specific food item?"
    }

    if (input.includes("handwashing") || input.includes("hygiene")) {
      return "Proper handwashing is crucial for food safety! Here's the correct procedure:\n\n1. Wet hands with clean, running warm water\n2. Apply soap and lather well\n3. Scrub for at least 20 seconds (sing 'Happy Birthday' twice!)\n4. Rinse thoroughly under running water\n5. Dry with a clean towel or air dry\n\nWash hands before handling food, after using the restroom, after touching raw meat, and after coughing or sneezing."
    }

    if (input.includes("storage") || input.includes("refrigerator")) {
      return "Proper food storage is essential! Here are key guidelines:\n\n• Keep refrigerator at 40°F (4°C) or below\n• Keep freezer at 0°F (-18°C) or below\n• Store raw meat on bottom shelf to prevent drips\n• Use the 'First In, First Out' (FIFO) method\n• Don't leave perishables in the danger zone (40-140°F) for more than 2 hours\n\nWhat specific storage question do you have?"
    }

    return "That's an interesting question! Food safety covers many important topics including proper cooking temperatures, hygiene practices, storage guidelines, and contamination prevention. Could you be more specific about what you'd like to learn? I'm here to help with any food safety concerns you might have!"
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Food Safety Coach</h1>
            <p className="text-gray-600">Get instant answers to your food safety questions</p>
          </div>

          {/* Chat Interface */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-emerald-600" />
                Chat with AI Coach
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "ai" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-emerald-100">
                            <Bot className="h-4 w-4 text-emerald-600" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.sender === "user" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${message.sender === "user" ? "text-emerald-100" : "text-gray-500"}`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.sender === "user" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100">
                            <User className="h-4 w-4 text-blue-600" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-emerald-100">
                          <Bot className="h-4 w-4 text-emerald-600" />
                        </AvatarFallback>
                      </Avatar>
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
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="flex gap-2 mt-4">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about food safety..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Questions */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Quick Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "What are safe cooking temperatures?",
                "How do I properly wash my hands?",
                "How should I store raw meat?",
                "What is the danger zone for food?",
              ].map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  className="justify-start h-auto p-3 text-left"
                  onClick={() => setInputMessage(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
