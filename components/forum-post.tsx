"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Clock, Pin, Flag, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Post {
  id: string
  title: string
  content: string
  author: string
  isAnonymous: boolean
  category: string
  tags: string[]
  timestamp: Date
  replies: number
  likes: number
  isModerated: boolean
  isPinned?: boolean
}

interface ForumPostProps {
  post: Post
}

export function ForumPost({ post }: ForumPostProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return timestamp.toLocaleDateString()
  }

  return (
    <Card className={`p-6 hover:shadow-md transition-shadow ${post.isPinned ? "border-primary/50 bg-primary/5" : ""}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {post.isAnonymous ? "?" : post.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{post.isAnonymous ? "Anonymous" : post.author}</span>
                {post.isModerated && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Verified
                  </Badge>
                )}
                {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{getTimeAgo(post.timestamp)}</span>
                <span>•</span>
                <span>{post.category}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Flag className="mr-2 h-4 w-4" />
                Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div>
          <h3 className="font-semibold text-lg mb-2 leading-tight">{post.title}</h3>
          <p className="text-muted-foreground leading-relaxed">{post.content}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm">{likeCount}</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.replies} replies</span>
            </Button>
          </div>

          <Button variant="outline" size="sm" className="bg-transparent">
            View Discussion
          </Button>
        </div>
      </div>
    </Card>
  )
}
