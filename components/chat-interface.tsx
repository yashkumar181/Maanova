"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, AlertCircle, Phone } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// --- NEW IMPORTS ---
import { onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
// -------------------

interface Message {
    id: string
    content: string
    sender: "user" | "bot"
    timestamp: Date
    type?: "normal" | "crisis" | "referral" | "error"
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
    
    // --- NEW STATE VARIABLES ---
    const [userUid, setUserUid] = useState<string | null>(null)
    const [collegeId, setCollegeId] = useState<string | null>(null)
    // ---------------------------

    // --- NEW useEffect TO GET USER DATA ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserUid(user.uid)
                const studentDocRef = doc(db, "students", user.uid)
                const studentSnap = await getDoc(studentDocRef)
                if (studentSnap.exists()) {
                    setCollegeId(studentSnap.data().collegeId)
                }
            } else {
                setUserUid(null)
                setCollegeId(null)
            }
        });
        return () => unsubscribe();
    }, []);
    // -------------------------------------

    // This hook handles the scrolling of the chat window
    useEffect(() => {
        const scrollArea = document.querySelector(".chat-scroll-area .viewport")
        if (scrollArea) {
            scrollArea.scrollTop = scrollArea.scrollHeight
        }
    }, [messages, isTyping])

    const generateBotResponse = async (userMessage: string) => {
        const apiUrl = "/api/chat";
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            })
            if (!response.ok) throw new Error("Network response was not ok")
            
            const data = await response.json()
            const botResponse: Message = {
                id: Date.now().toString(),
                content: data.response,
                sender: "bot",
                timestamp: new Date(),
                type: data.type,
            }
            setMessages((prev) => [...prev, botResponse])
        } catch (error) {
            console.error("Error fetching chatbot response:", error)
            const errorMessage: Message = {
                id: Date.now().toString(),
                content: "I'm having trouble responding right now. Please try again later.",
                sender: "bot",
                timestamp: new Date(),
                type: "error",
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsTyping(false)
        }
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isTyping) return

        // --- MODIFICATION: CHECK FOR USER ---
        if (!userUid || !collegeId) {
            // This can be replaced with a more user-friendly toast notification
            alert("You must be logged in to use the chat.");
            return;
        }
        // ------------------------------------

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue,
            sender: "user",
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        const messageToSend = inputValue; // Capture value before clearing
        setInputValue("")
        setIsTyping(true)

        // --- NEW LOGIC: SAVE TO FIREBASE ---
        try {
            await addDoc(collection(db, "chatSessions"), {
                studentUid: userUid,
                collegeId: collegeId,
                content: messageToSend,
                sender: "user",
                timestamp: serverTimestamp(),
                // You can add other metadata here if needed
            });
        } catch (error) {
            console.error("Error saving chat message:", error);
        }
        // ------------------------------------

        generateBotResponse(messageToSend)
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

                <ScrollArea className="h-96 mb-4 p-4 border rounded-lg chat-scroll-area">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`flex items-start space-x-2 max-w-[80%] ${
                                        message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                                    }`}
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
                                                    onClick={() => window.open("tel:988", "_self")}
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
                                                    onClick={() => window.location.href = "/booking"}
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
                        disabled={isTyping}
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
