"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ForumPost } from "@/components/forum-post"
import { CreatePostModal } from "@/components/create-post-modal"
import { CommunityGuidelines } from "@/components/community-guidelines"
import { Search, Plus, Shield, Users, MessageCircle, TrendingUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

const forumPosts: Post[] = [
  {
    id: "1",
    title: "Dealing with exam anxiety - what works for you?",
    content:
      "Finals are coming up and I'm feeling overwhelmed. I've tried breathing exercises but still feel panicked when I sit down to study. What strategies have helped you manage exam anxiety?",
    author: "StudyStressed",
    isAnonymous: false,
    category: "Academic Stress",
    tags: ["anxiety", "exams", "study tips"],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    replies: 12,
    likes: 8,
    isModerated: true,
  },
  {
    id: "2",
    title: "Feeling isolated in my dorm",
    content:
      "I'm a freshman and having trouble connecting with people. My roommate is never around and I feel really lonely. How did you make friends in college?",
    author: "Anonymous",
    isAnonymous: true,
    category: "Social Connection",
    tags: ["loneliness", "friendship", "freshman"],
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    replies: 18,
    likes: 15,
    isModerated: true,
  },
  {
    id: "3",
    title: "Success story: Getting help for depression",
    content:
      "I wanted to share that after months of struggling, I finally reached out to campus counseling. It was scary but it's been so helpful. If you're on the fence about getting help, this is your sign to try.",
    author: "HopefulSenior",
    isAnonymous: false,
    category: "Success Stories",
    tags: ["depression", "counseling", "hope"],
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    replies: 25,
    likes: 42,
    isModerated: true,
    isPinned: true,
  },
  {
    id: "4",
    title: "Balancing work and school stress",
    content:
      "Working 20 hours a week while taking a full course load. Anyone else juggling work and school? How do you manage the stress and time management?",
    author: "WorkingStudent23",
    isAnonymous: false,
    category: "Academic Stress",
    tags: ["work-life balance", "time management", "stress"],
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    replies: 9,
    likes: 6,
    isModerated: true,
  },
  {
    id: "5",
    title: "Relationship ended, feeling lost",
    content:
      "My long-term relationship just ended and I don't know how to cope. We were together since high school. Has anyone been through something similar? How did you get through it?",
    author: "Anonymous",
    isAnonymous: true,
    category: "Relationships",
    tags: ["breakup", "grief", "support"],
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    replies: 14,
    likes: 11,
    isModerated: true,
  },
  {
    id: "6",
    title: "Tips for better sleep schedule",
    content:
      "I've been staying up until 3am every night and it's affecting my mental health. What are your best tips for fixing a messed up sleep schedule?",
    author: "NightOwl2024",
    isAnonymous: false,
    category: "Wellness",
    tags: ["sleep", "health", "routine"],
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    replies: 16,
    likes: 13,
    isModerated: true,
  },
]

const categories = [
  { name: "All Posts", icon: MessageCircle, count: forumPosts.length },
  {
    name: "Academic Stress",
    icon: TrendingUp,
    count: forumPosts.filter((p) => p.category === "Academic Stress").length,
  },
  {
    name: "Social Connection",
    icon: Users,
    count: forumPosts.filter((p) => p.category === "Social Connection").length,
  },
  {
    name: "Relationships",
    icon: MessageCircle,
    count: forumPosts.filter((p) => p.category === "Relationships").length,
  },
  { name: "Wellness", icon: Shield, count: forumPosts.filter((p) => p.category === "Wellness").length },
  {
    name: "Success Stories",
    icon: TrendingUp,
    count: forumPosts.filter((p) => p.category === "Success Stories").length,
  },
]

export function PeerSupportForum() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Posts")
  const [sortBy, setSortBy] = useState("recent")
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [showGuidelines, setShowGuidelines] = useState(false)

  const filteredPosts = forumPosts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "All Posts" || post.category === selectedCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      switch (sortBy) {
        case "recent":
          return b.timestamp.getTime() - a.timestamp.getTime()
        case "popular":
          return b.likes - a.likes
        case "replies":
          return b.replies - a.replies
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Community Guidelines Alert */}
      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">
            This is a safe, moderated space. Please be respectful and follow our community guidelines.
          </span>
          <Button variant="link" size="sm" onClick={() => setShowGuidelines(true)} className="text-primary p-0 h-auto">
            View Guidelines
          </Button>
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <Button
              onClick={() => setIsCreatePostOpen(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Categories</h3>
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "secondary" : "ghost"}
                  className="w-full justify-between text-left"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <div className="flex items-center space-x-2">
                    <category.icon className="h-4 w-4" />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Forum Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Posts</span>
                <span className="font-medium">{forumPosts.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Today</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span>Moderators Online</span>
                <span className="font-medium text-green-600">3</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search and Sort */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-md text-sm bg-background"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Liked</option>
                <option value="replies">Most Replies</option>
              </select>
            </div>
          </Card>

          {/* Posts */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <ForumPost key={post.id} post={post} />
            ))}

            {filteredPosts.length === 0 && (
              <Card className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or browse different categories.
                </p>
                <Button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create the first post
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />

      <CommunityGuidelines isOpen={showGuidelines} onClose={() => setShowGuidelines(false)} />
    </div>
  )
}
