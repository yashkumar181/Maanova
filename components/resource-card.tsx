"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Video, Headphones, FileText, Download, Play, Pause, Clock, Globe, ExternalLink, BookOpen } from "lucide-react"

interface Resource {
  id: string
  title: string
  description: string
  type: "video" | "audio" | "article" | "guide" | "tool"
  category: string
  duration?: string
  language: string
  difficulty: "beginner" | "intermediate" | "advanced"
  tags: string[]
  thumbnail?: string
  url?: string
  audioUrl?: string
  downloadUrl?: string
}

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const getTypeIcon = () => {
    switch (resource.type) {
      case "video":
        return <Video className="h-5 w-5" />
      case "audio":
        return <Headphones className="h-5 w-5" />
      case "article":
        return <FileText className="h-5 w-5" />
      case "guide":
        return <BookOpen className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getDifficultyColor = () => {
    switch (resource.difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying)
    // In a real implementation, you would control actual audio playback here
    if (!isPlaying) {
      // Simulate progress for demo
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsPlaying(false)
            return 0
          }
          return prev + 2
        })
      }, 200)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail for videos */}
      {resource.type === "video" && resource.thumbnail && (
        <div className="relative h-48 bg-muted">
          <img
            src={resource.thumbnail || "/placeholder.svg?height=200&width=400&query=mental health video thumbnail"}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="p-3 bg-white/90 rounded-full">
              <Play className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 text-primary">
            {getTypeIcon()}
            <span className="text-sm font-medium capitalize">{resource.type}</span>
          </div>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span className="text-xs">{resource.language}</span>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-2 leading-tight">{resource.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{resource.description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{resource.duration}</span>
            </div>
            <Badge variant="outline" className={getDifficultyColor()}>
              {resource.difficulty}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Audio Player */}
        {resource.type === "audio" && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Button size="sm" variant="outline" onClick={handlePlayAudio}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <span className="text-sm font-medium">Audio Preview</span>
            </div>
            {isPlaying && <Progress value={progress} className="h-2" />}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {resource.type === "video" && resource.url && (
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="mr-2 h-4 w-4" />
              Watch Video
            </Button>
          )}

          {resource.type === "audio" && resource.audioUrl && (
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Headphones className="mr-2 h-4 w-4" />
              Listen Now
            </Button>
          )}

          {resource.type === "article" && (
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <FileText className="mr-2 h-4 w-4" />
              Read Article
            </Button>
          )}

          {(resource.type === "guide" || resource.downloadUrl) && (
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          )}

          {resource.url && resource.type !== "video" && (
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Resource
            </Button>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Category: {resource.category}</p>
        </div>
      </div>
    </Card>
  )
}
