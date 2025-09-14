"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, AlertCircle, Phone, Star } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, serverTimestamp, getDoc, doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useToast } from "./ui/use-toast"

// The Message interface is now simpler
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
            content: "Hello! I'm here to provide mental health support and guidance. How are you feeling today? Remember, this is a safe and confidential space.",
            sender: "bot",
            timestamp: new Date(),
        },
    ])
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [userUid, setUserUid] = useState<string | null>(null)
    const [collegeId, setCollegeId] = useState<string | null>(null)
    const { toast } = useToast()
    
    // --- NEW STATE VARIABLES ---
    const [latestSessionId, setLatestSessionId] = useState<string | null>(null);
    const [showRatingArea, setShowRatingArea] = useState(false);
    // ---------------------------

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
                body: JSON.stringify({ message: userMessageContent, userUid: userUid }),
            });
            
            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            const { response: reply, type, topic } = data;
            
            const chatSessionRef = await addDoc(collection(db, "chatSessions"), {
                studentUid: userUid,
                collegeId: collegeId,
                content: userMessageContent,
                sender: "user",
                timestamp: serverTimestamp(),
                topic: topic,
            });
            
            // --- NEW: Store the latest session ID for rating later ---
            setLatestSessionId(chatSessionRef.id);

            const botResponse: Message = {
                id: Date.now().toString(),
                content: reply,
                sender: "bot",
                timestamp: new Date(),
                type: type,
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
    
    // --- UPDATED: Rating function now uses the stored session ID ---
    const handleRateSession = async (rating: number) => {
        if (!latestSessionId) {
            toast({ title: "Error", description: "No session to rate. Please send a message first.", variant: "destructive" });
            return;
        }

        try {
            const sessionRef = doc(db, "chatSessions", latestSessionId);
            await updateDoc(sessionRef, { rating: rating });
            
            setShowRatingArea(false); // Hide the rating area after submission
            toast({ title: "Thank you for your feedback!" });
        } catch (error) {
            console.error("Error submitting rating:", error);
            toast({ title: "Error", description: "Could not submit rating.", variant: "destructive"});
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <div className="p-6">
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
                                    <div className={`p-3 rounded-lg ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                        {/* Individual message rating UI is now removed */}
                                        {message.type === "crisis" && ( <div className="mt-3 pt-3 border-t border-destructive/20"><Button size="sm" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={() => window.open("tel:988", "_self")}><Phone className="mr-2 h-3 w-3" /> Call Crisis Line: 988</Button></div> )}
                                        {message.type === "referral" && ( <div className="mt-3 pt-3 border-t border-accent/20"><Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent/10 bg-transparent" onClick={() => window.location.href = "/booking"}>Book Counselor Appointment</Button></div> )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && ( <div className="flex justify-start"><div className="flex items-center space-x-2"><div className="p-2 rounded-full bg-muted"><Bot className="h-4 w-4 text-muted-foreground" /></div><div className="bg-muted p-3 rounded-lg"><div className="flex space-x-1"><div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div><div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div><div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div></div></div></div></div> )}
                    </div>
                </ScrollArea>

                {/* --- NEW: Conditional UI for Chat Input OR Rating Area --- */}
                {!showRatingArea ? (
                    <>
                        <div className="flex space-x-2">
                            <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Share what's on your mind..." className="flex-1" disabled={isTyping} />
                            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}><Send className="h-4 w-4" /></Button>
                        </div>
                        <div className="mt-4 text-center">
                            <Button variant="outline" size="sm" onClick={() => setShowRatingArea(true)}>End & Rate Session</Button>
                        </div>
                    </>
                ) : (
                    <div className="mt-4 text-center p-4 border-t">
                        <p className="text-md font-semibold mb-2">How would you rate this session?</p>
                        <div className="flex justify-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Button key={star} variant="ghost" size="icon" onClick={() => handleRateSession(star)}>
                                    <Star className="h-6 w-6 text-yellow-400 hover:fill-yellow-400" />
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
                {/* -------------------------------------------------------- */}
            </div>
        </Card>
    )
}