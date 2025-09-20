"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Users } from "lucide-react"

interface TrendAnalysisProps {
  dateRange: string
}

const mentalHealthTrends = [
  { month: "Jan", anxiety: 45, depression: 32, stress: 58, wellness: 25 },
  { month: "Feb", anxiety: 52, depression: 38, stress: 62, wellness: 28 },
  { month: "Mar", anxiety: 48, depression: 35, stress: 55, wellness: 32 },
  { month: "Apr", anxiety: 61, depression: 42, stress: 68, wellness: 29 },
  { month: "May", anxiety: 38, depression: 28, stress: 45, wellness: 35 },
  { month: "Jun", anxiety: 29, depression: 22, stress: 38, wellness: 42 },
]

const seasonalPatterns = [
  { period: "Fall Semester Start", level: 75 },
  { period: "Mid-October", level: 45 },
  { period: "Midterms", level: 85 },
  { period: "Thanksgiving Break", level: 30 },
  { period: "Finals", level: 95 },
  { period: "Winter Break", level: 25 },
  { period: "Spring Semester", level: 55 },
  { period: "Spring Break", level: 35 },
  { period: "Final Exams", level: 90 },
]

export function TrendAnalysis({ dateRange }: TrendAnalysisProps) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium">Anxiety Trend</span>
          </div>
          <p className="text-2xl font-bold">+15%</p>
          <p className="text-xs text-muted-foreground">vs last period</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Depression</span>
          </div>
          <p className="text-2xl font-bold">-8%</p>
          <p className="text-xs text-muted-foreground">Improvement noted</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium">Academic Stress</span>
          </div>
          <p className="text-2xl font-bold">+22%</p>
          <p className="text-xs text-muted-foreground">Finals approaching</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Wellness Engagement</span>
          </div>
          <p className="text-2xl font-bold">+35%</p>
          <p className="text-xs text-muted-foreground">Resource usage up</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Mental Health Topic Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={mentalHealthTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="anxiety" stroke="#ef4444" strokeWidth={2} name="Anxiety" />
            <Line type="monotone" dataKey="depression" stroke="#3b82f6" strokeWidth={2} name="Depression" />
            <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} name="Academic Stress" />
            <Line type="monotone" dataKey="wellness" stroke="#10b981" strokeWidth={2} name="Wellness" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Seasonal Stress Patterns</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={seasonalPatterns}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="level" stroke="#0891b2" fill="#0891b2" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Anxiety-related support requests peak during midterms and finals periods.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Depression support shows improvement with increased counselor availability.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Wellness resource engagement increases during break periods.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Academic stress correlates strongly with semester schedule.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-800">Increase Resources</p>
              <p className="text-blue-700">Add more anxiety management content before exam periods.</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium text-green-800">Proactive Outreach</p>
              <p className="text-green-700">Send wellness reminders during high-stress periods.</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="font-medium text-orange-800">Staff Planning</p>
              <p className="text-orange-700">Schedule additional counselors during peak demand.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
