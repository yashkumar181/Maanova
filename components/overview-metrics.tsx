"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, MessageCircle, Calendar, BookOpen, AlertTriangle, Heart } from "lucide-react"

interface OverviewMetricsProps {
  dateRange: string
}


export function OverviewMetrics({ dateRange }: OverviewMetricsProps) {
  // Mock data - in real implementation, this would come from your analytics API
  const metrics = [
    {
      title: "Active Users",
      value: "1,247",
      change: "+12%",
      trend: "up",
      icon: Users,
      description: "Students using the platform",
    },
    {
      title: "Chat Sessions",
      value: "3,892",
      change: "+8%",
      trend: "up",
      icon: MessageCircle,
      description: "AI chatbot interactions",
    },
    {
      title: "Counselor Bookings",
      value: "156",
      change: "+23%",
      trend: "up",
      icon: Calendar,
      description: "Appointments scheduled",
    },
    {
      title: "Resources Accessed",
      value: "2,341",
      change: "+15%",
      trend: "up",
      icon: BookOpen,
      description: "Videos, articles, and guides viewed",
    },
    {
      title: "Forum Posts",
      value: "89",
      change: "-5%",
      trend: "down",
      icon: MessageCircle,
      description: "New peer support discussions",
    },
    {
      title: "Crisis Interventions",
      value: "12",
      change: "+2",
      trend: "up",
      icon: AlertTriangle,
      description: "Emergency support provided",
    },
    {
      title: "Satisfaction Score",
      value: "4.6/5",
      change: "+0.2",
      trend: "up",
      icon: Heart,
      description: "Average user rating",
    },
    {
      title: "Response Time",
      value: "2.3min",
      change: "-15%",
      trend: "up",
      icon: TrendingUp,
      description: "Average support response time",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <metric.icon className="h-5 w-5 text-primary" />
            <div className={`flex items-center text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {metric.trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {metric.change}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.title}</p>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
