"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flag, Eye, CheckCircle, X, MessageCircle, AlertTriangle } from "lucide-react"

const pendingPosts = [
  {
    id: "1",
    title: "Struggling with severe anxiety attacks",
    author: "Anonymous",
    content: "I've been having panic attacks daily and don't know what to do...",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    flags: 2,
    category: "Anxiety Management",
    riskLevel: "medium",
  },
  {
    id: "2",
    title: "Success story: Found help through counseling",
    author: "HopefulStudent",
    content: "I wanted to share my positive experience with campus counseling...",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    flags: 0,
    category: "Success Stories",
    riskLevel: "low",
  },
  {
    id: "3",
    title: "Relationship problems affecting my mental health",
    author: "Anonymous",
    content: "My relationship ended and I'm having dark thoughts...",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    flags: 1,
    category: "Relationships",
    riskLevel: "high",
  },
]

const reportedContent = [
  {
    id: "1",
    type: "post",
    reason: "Inappropriate content",
    reporter: "Anonymous",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "pending",
  },
  {
    id: "2",
    type: "comment",
    reason: "Spam",
    reporter: "User123",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: "resolved",
  },
]

export function ModerationTools() {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Pending Review</span>
          </div>
          <p className="text-2xl font-bold">8</p>
          <p className="text-xs text-muted-foreground">Posts awaiting approval</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Flag className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium">Reported Content</span>
          </div>
          <p className="text-2xl font-bold">3</p>
          <p className="text-xs text-muted-foreground">Requires attention</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Approved Today</span>
          </div>
          <p className="text-2xl font-bold">24</p>
          <p className="text-xs text-muted-foreground">Posts approved</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium">High Risk</span>
          </div>
          <p className="text-2xl font-bold">2</p>
          <p className="text-xs text-muted-foreground">Require immediate review</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Posts Pending Review</h3>
        <div className="space-y-4">
          {pendingPosts.map((post) => (
            <div key={post.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{post.title}</h4>
                    <Badge variant="outline" className={getRiskColor(post.riskLevel)}>
                      {post.riskLevel.toUpperCase()}
                    </Badge>
                    {post.flags > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {post.flags} flags
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    By {post.author} • {post.timestamp.toLocaleTimeString()} • {post.category}
                  </p>
                  <p className="text-sm">{post.content}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                >
                  <X className="mr-1 h-3 w-3" />
                  Reject
                </Button>
                <Button size="sm" variant="outline" className="bg-transparent">
                  <MessageCircle className="mr-1 h-3 w-3" />
                  Contact User
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Reported Content</h3>
        <div className="space-y-4">
          {reportedContent.map((report) => (
            <div key={report.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{report.type.toUpperCase()}</Badge>
                  <span className="text-sm font-medium">{report.reason}</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    report.status === "resolved"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }
                >
                  {report.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Reported by {report.reporter} • {report.timestamp.toLocaleString()}
              </p>
              {report.status === "pending" && (
                <div className="flex items-center space-x-2 mt-3">
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <Eye className="mr-1 h-3 w-3" />
                    Review
                  </Button>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
