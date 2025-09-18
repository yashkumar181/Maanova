"use client"

import type React from "react"
import { useState } from "react"
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Send, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { db } from "@/lib/firebase"
import { useToast } from "./ui/use-toast"
import { TagSelector } from "./tag-selector" // 👈 Import the new component

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  collegeId: string | null
  userUid: string | null
}

const categories = [
  "Academic Stress",
  "Social Connection",
  "Relationships",
  "Wellness",
  "Success Stories",
  "General Support",
]

const predefinedTags = [
  "Anxiety",
  "Depression",
  "Stress",
  "Exams",
  "Academic Stress",
  "Relationships",
  "Loneliness",
  "Self-Care",
  "Procrastination",
  "Sleep Issues",
  "Career Planning",
  "Seeking Advice",
]

export function CreatePostModal({ isOpen, onClose, collegeId, userUid }: CreatePostModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userUid || !collegeId) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const studentDoc = await getDoc(doc(db, "students", userUid))
      const authorUsername = studentDoc.exists() ? studentDoc.data()?.username : "Anonymous"

      await addDoc(collection(db, "forumPosts"), {
        title,
        content,
        category,
        authorUsername,
        isAnonymous,
        tags: selectedTags,
        timestamp: Timestamp.now(),
        collegeId,
        userUid,
        status: "pending",
        isModerated: false,
        replies: 0,
        likes: 0,
        flags: 0,
        riskLevel: "low",
      })

      toast({
        title: "Success!",
        description: "Your post has been submitted for review.",
      })
      handleClose()
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: "Could not create post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleClose = () => {
    setTitle("");
    setContent("");
    setCategory("");
    setIsAnonymous(false);
    setSelectedTags([]);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create New Post</span>
          </DialogTitle>
        </DialogHeader>

        <Alert className="border-primary/20 bg-primary/5">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            Remember to be respectful and supportive. Posts are reviewed by trained moderators to ensure a safe
            environment.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Post Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What would you like to discuss?" required maxLength={100} />
              <p className="text-xs text-muted-foreground mt-1">{title.length}/100 characters</p>
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-medium">Your Message</Label>
              <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your thoughts, experiences, or questions..." rows={6} required maxLength={1000} />
              <p className="text-xs text-muted-foreground mt-1">{content.length}/1000 characters</p>
            </div>

            {/* 👇 REPLACE the old tag UI with the new TagSelector 👇 */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Tags (optional, max 5)</Label>
              <TagSelector
                predefinedTags={predefinedTags}
                selectedTags={selectedTags}
                onTagChange={setSelectedTags}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              <Label htmlFor="anonymous" className="text-sm">Post anonymously</Label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent" disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || !title.trim() || !content.trim() || !category}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Create Post
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}