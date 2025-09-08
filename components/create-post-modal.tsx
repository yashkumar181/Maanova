"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Send, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

const categories = [
  "Academic Stress",
  "Social Connection",
  "Relationships",
  "Wellness",
  "Success Stories",
  "General Support",
]

const suggestedTags = [
  "anxiety",
  "depression",
  "stress",
  "loneliness",
  "friendship",
  "relationships",
  "study tips",
  "exams",
  "sleep",
  "exercise",
  "counseling",
  "therapy",
  "self-care",
  "motivation",
  "hope",
  "recovery",
  "support",
]

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate post creation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Reset form
    setTitle("")
    setContent("")
    setCategory("")
    setIsAnonymous(false)
    setTags([])
    setNewTag("")
    setIsSubmitting(false)
    onClose()
  }

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault()
      addTag(newTag.trim())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <Label htmlFor="title" className="text-sm font-medium">
                Post Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What would you like to discuss?"
                required
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">{title.length}/100 characters</p>
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-medium">
                Your Message
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, experiences, or questions. Remember to be respectful and supportive."
                rows={6}
                required
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">{content.length}/1000 characters</p>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Tags (optional, max 5)</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>#{tag}</span>
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    disabled={tags.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTag(newTag.trim())}
                    disabled={!newTag.trim() || tags.length >= 5}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground">Suggested:</span>
                  {suggestedTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      disabled={tags.includes(tag) || tags.length >= 5}
                      className="text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              <Label htmlFor="anonymous" className="text-sm">
                Post anonymously
              </Label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting || !title.trim() || !content.trim() || !category}
            >
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
