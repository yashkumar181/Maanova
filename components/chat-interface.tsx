"use client"


import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, AlertCircle, Phone } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "normal" | "crisis" | "referral"
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm here to provide mental health support and guidance. How are you feeling today? Remember, this is a safe and confidential space.",
      sender: "bot",
      timestamp: new Date(),
      type: "normal",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const crisisKeywords = ["suicide", "kill myself", "end it all", "hurt myself", "die"]
  const anxietyKeywords = ["anxious", "anxiety", "panic", "worried", "stress", "overwhelmed"]
  const depressionKeywords = ["depressed", "sad", "hopeless", "empty", "worthless"]

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase()

    // Crisis detection
    if (crisisKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return {
        id: Date.now().toString(),
        content:
          "I'm very concerned about what you're sharing. Your safety is the most important thing right now. Please reach out to a crisis counselor immediately at 988 (Suicide & Crisis Lifeline) or contact your campus emergency services. Would you like me to help you find immediate professional support?",
        sender: "bot",
        timestamp: new Date(),
        type: "crisis",
      }
    }

    // Anxiety support
    if (anxietyKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return {
        id: Date.now().toString(),
        content:
          "I hear that you're feeling anxious or stressed. That's really common among college students. Let's try a quick breathing exercise: Breathe in for 4 counts, hold for 4, breathe out for 6. Repeat this 3 times. Would you like some specific coping strategies for managing anxiety, or would you prefer to talk to a counselor?",
        sender: "bot",
        timestamp: new Date(),
        type: "normal",
      }
    }

    // Depression support
    if (depressionKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return {
        id: Date.now().toString(),
        content:
          "Thank you for sharing how you're feeling. Depression can make everything feel harder, but you're not alone in this. Small steps can make a difference - have you been able to eat, sleep, or connect with anyone today? I can help you find professional support or coping resources. What feels most helpful right now?",
        sender: "bot",
        timestamp: new Date(),
        type: "referral",
      }
    }

    // General supportive responses
    const supportiveResponses = [
      "Thank you for sharing that with me. It takes courage to reach out. Can you tell me more about what's been on your mind lately?",
      "I'm here to listen and support you. What's been the most challenging part of your day or week?",
      "It sounds like you're going through something difficult. Would you like to explore some coping strategies, or would you prefer to talk about what's bothering you?",
      "Your feelings are valid, and it's okay to not be okay sometimes. What kind of support would be most helpful for you right now?",
    ]

    return {
      id: Date.now().toString(),
      content: supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)],
      sender: "bot",
      timestamp: new Date(),
      type: "normal",
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue)
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }


  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-full">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Mental Health Support</h2>
            <p className="text-sm text-muted-foreground">Confidential chat support available 24/7</p>
          </div>
        </div>

        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            This AI provides initial support and coping strategies. For immediate crisis support, call 988 or contact
            campus emergency services.
          </AlertDescription>
        </Alert>

        <ScrollArea className="h-96 mb-4 p-4 border rounded-lg">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div className={`p-2 rounded-full ${message.sender === "user" ? "bg-primary/10" : "bg-muted"}`}>
                    {message.sender === "user" ? (
                      <User className="h-4 w-4 text-primary" />
                    ) : (
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.type === "crisis"
                          ? "bg-destructive/10 border border-destructive/20"
                          : message.type === "referral"
                            ? "bg-accent/10 border border-accent/20"
                            : "bg-muted"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {message.type === "crisis" && (
                      <div className="mt-3 pt-3 border-t border-destructive/20">
                        <Button
                          size="sm"
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          <Phone className="mr-2 h-3 w-3" />
                          Call Crisis Line: 988
                        </Button>
                      </div>
                    )}
                    {message.type === "referral" && (
                      <div className="mt-3 pt-3 border-t border-accent/20">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-accent text-accent hover:bg-accent/10 bg-transparent"
                        >
                          Book Counselor Appointment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-muted">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind... (Press Enter to send)"
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Need immediate help? Call 988 (Suicide & Crisis Lifeline) or your campus emergency services
          </p>
        </div>
      </div>
    </Card>
  )
}
