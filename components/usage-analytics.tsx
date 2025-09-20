"use client"

import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface UsageAnalyticsProps {
  dateRange: string
}

const dailyUsage = [
  { day: "Mon", chatSessions: 45, bookings: 8, resources: 32, forum: 12 },
  { day: "Tue", chatSessions: 52, bookings: 12, resources: 28, forum: 15 },
  { day: "Wed", chatSessions: 48, bookings: 6, resources: 35, forum: 9 },
  { day: "Thu", chatSessions: 61, bookings: 15, resources: 42, forum: 18 },
  { day: "Fri", chatSessions: 38, bookings: 9, resources: 25, forum: 7 },
  { day: "Sat", chatSessions: 29, bookings: 4, resources: 18, forum: 11 },
  { day: "Sun", chatSessions: 33, bookings: 3, resources: 22, forum: 14 },
]

const hourlyPattern = [
  { hour: "6AM", usage: 5 },
  { hour: "8AM", usage: 12 },
  { hour: "10AM", usage: 25 },
  { hour: "12PM", usage: 35 },
  { hour: "2PM", usage: 42 },
  { hour: "4PM", usage: 38 },
  { hour: "6PM", usage: 45 },
  { hour: "8PM", usage: 52 },
  { hour: "10PM", usage: 48 },
  { hour: "12AM", usage: 28 },
]

const featureUsage = [
  { name: "AI Chat", value: 45, color: "#0891b2" },
  { name: "Resources", value: 28, color: "#f97316" },
  { name: "Bookings", value: 15, color: "#22c55e" },
  { name: "Forum", value: 12, color: "#a855f7" },
]

export function UsageAnalytics({ dateRange }: UsageAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Feature Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="chatSessions" fill="#0891b2" name="Chat Sessions" />
              <Bar dataKey="bookings" fill="#f97316" name="Bookings" />
              <Bar dataKey="resources" fill="#22c55e" name="Resources" />
              <Bar dataKey="forum" fill="#a855f7" name="Forum Posts" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Hourly Usage Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyPattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="usage" stroke="#0891b2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Feature Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={featureUsage}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {featureUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Resources</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Breathing Techniques Video</span>
              <span className="text-sm font-medium">234 views</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Study Stress Guide</span>
              <span className="text-sm font-medium">189 downloads</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Mindfulness Audio</span>
              <span className="text-sm font-medium">156 plays</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sleep Hygiene Article</span>
              <span className="text-sm font-medium">142 reads</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Anxiety Management</span>
              <span className="text-sm font-medium">128 views</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
