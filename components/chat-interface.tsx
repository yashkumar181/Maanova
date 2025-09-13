"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, AlertCircle, Phone, Star } from "lucide-react" // Added Star icon
import { Alert, AlertDescription } from "@/components/ui/alert"
import { onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, serverTimestamp, getDoc, doc, updateDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { cn } from "@/lib/utils" // Import cn utility for dynamic classes
import { useToast } from "./ui/use-toast"


interface Message {
    id: string
    content: string
    sender: "user" | "bot"
    timestamp: Date
    type?: "normal" | "crisis" | "referral" | "error"
    // NEW: Add optional properties for rating UI
    showRating?: boolean;
    chatSessionId?: string;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "Hello! I'm here to provide mental health support and guidance. How are you feeling today? Remember, this is a safe and confidential space.",
            sender: "bot",
            timestamp: new Date(),
            type: "normal",
        },
    ])
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [userUid, setUserUid] = useState<string | null>(null)
    const [collegeId, setCollegeId] = useState<string | null>(null)
    const { toast } = useToast()

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

    useEffect(() => {
        const scrollArea = document.querySelector(".chat-scroll-area .viewport")
        if (scrollArea) {
            scrollArea.scrollTop = scrollArea.scrollHeight
        }
    }, [messages, isTyping])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isTyping) return

        if (!userUid || !collegeId) {
            toast({ title: "Login Required", description: "You must be logged in to use the chat.", variant: "destructive" });
            return;
        }

        const userMessageContent = inputValue;
        const userMessage: Message = {
            id: Date.now().toString(),
            content: userMessageContent,
            sender: "user",
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInputValue("")
        setIsTyping(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessageContent, userUid: userUid }), // Send userUid to backend
            });
            
            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            const { response: reply, type, topic } = data;
            
            // --- NEW LOGIC: Save chat and get its ID for rating ---
            const chatSessionRef = await addDoc(collection(db, "chatSessions"), {
                studentUid: userUid,
                collegeId: collegeId,
                content: userMessageContent,
                sender: "user",
                timestamp: serverTimestamp(),
                topic: topic,
            });
            // --------------------------------------------------------

            const botResponse: Message = {
                id: Date.now().toString(),
                content: reply,
                sender: "bot",
                timestamp: new Date(),
                type: type,
                showRating: true, // Show rating UI after bot responds
                chatSessionId: chatSessionRef.id // Pass the ID to the message
            }
            setMessages((prev) => [...prev, botResponse]);

        } catch (error) {
            console.error("Error in chat interaction:", error);
            const errorMessage: Message = {
                id: Date.now().toString(),
                content: "I'm having trouble responding right now. Please try again later.",
                sender: "bot",
                timestamp: new Date(),
                type: "error",
            }
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false)
        }
    }
    
    // --- NEW FUNCTION: Handle Rating Submission ---
    const handleRateSession = async (chatSessionId: string, rating: number) => {
        try {
            const sessionRef = doc(db, "chatSessions", chatSessionId);
            await updateDoc(sessionRef, { rating: rating });
            
            // Update the UI to hide the rating component for this message
            setMessages(prevMessages => prevMessages.map(msg => 
                msg.chatSessionId === chatSessionId ? { ...msg, showRating: false } : msg
            ));

            toast({ title: "Thank you!", description: "Your feedback helps us improve." });
        } catch (error) {
            console.error("Error submitting rating:", error);
            toast({ title: "Error", description: "Could not submit rating.", variant: "destructive"});
        }
    };
    // -------------------------------------------

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <div className="p-6">
                {/* Chat Header and Alert - No changes needed here */}
                <div className="flex items-center space-x-3 mb-6"><div className="p-2 bg-primary/10 rounded-full"><Bot className="h-6 w-6 text-primary" /></div><div><h2 className="text-xl font-semibold">AI Mental Health Support</h2><p className="text-sm text-muted-foreground">Confidential chat support available 24/7</p></div></div>
                <Alert className="mb-6 border-primary/20 bg-primary/5"><AlertCircle className="h-4 w-4 text-primary" /><AlertDescription className="text-sm">This AI provides initial support and coping strategies. For immediate crisis support, call 988 or contact campus emergency services.</AlertDescription></Alert>

                <ScrollArea className="h-96 mb-4 p-4 border rounded-lg chat-scroll-area">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                                    <div className={`p-2 rounded-full ${message.sender === "user" ? "bg-primary/10" : "bg-muted"}`}>
                                        {message.sender === "user" ? (<User className="h-4 w-4 text-primary" />) : (<Bot className="h-4 w-4 text-muted-foreground" />)}
                                    </div>
                                    <div className={`p-3 rounded-lg ${message.sender === "user" ? "bg-primary text-primary-foreground" : message.type === "crisis" ? "bg-destructive/10 border border-destructive/20" : message.type === "referral" ? "bg-accent/10 border border-accent/20" : "bg-muted"}`}>
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                        
                                        {/* --- NEW RATING UI --- */}
                                        {message.showRating && message.chatSessionId && (
                                            <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                                                <p className="text-xs text-muted-foreground mb-2">Rate this response:</p>
                                                <div className="flex space-x-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Button key={star} variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRateSession(message.chatSessionId!, star)}>
                                                            <Star className="h-4 w-4 text-yellow-400 hover:fill-yellow-400" />
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {/* ----------------------- */}

                                        {message.type === "crisis" && ( <div className="mt-3 pt-3 border-t border-destructive/20"><Button size="sm" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={() => window.open("tel:988", "_self")}><Phone className="mr-2 h-3 w-3" /> Call Crisis Line: 988</Button></div> )}
                                        {message.type === "referral" && ( <div className="mt-3 pt-3 border-t border-accent/20"><Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent/10 bg-transparent" onClick={() => window.location.href = "/booking"}>Book Counselor Appointment</Button></div> )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && ( <div className="flex justify-start"><div className="flex items-center space-x-2"><div className="p-2 rounded-full bg-muted"><Bot className="h-4 w-4 text-muted-foreground" /></div><div className="bg-muted p-3 rounded-lg"><div className="flex space-x-1"><div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div><div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div><div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div></div></div></div></div> )}
                    </div>
                </ScrollArea>

                {/* Input and Footer - No changes needed here */}
                <div className="flex space-x-2"><Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Share what's on your mind... (Press Enter to send)" className="flex-1" disabled={isTyping} /><Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}><Send className="h-4 w-4" /></Button></div>
                <div className="mt-4 text-center"><p className="text-xs text-muted-foreground">Need immediate help? Call 988 (Suicide & Crisis Lifeline) or your campus emergency services</p></div>
            </div>
        </Card>
    )
}

