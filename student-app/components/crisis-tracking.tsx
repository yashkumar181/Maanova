"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Phone, Clock, CheckCircle, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CrisisTrackingProps {
  dateRange: string
}

const crisisEvents = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: "high",
    status: "resolved",
    responseTime: "3 minutes",
    followUpRequired: false,
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    severity: "medium",
    status: "monitoring",
    responseTime: "5 minutes",
    followUpRequired: true,
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    severity: "high",
    status: "resolved",
    responseTime: "2 minutes",
    followUpRequired: false,
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    severity: "low",
    status: "resolved",
    responseTime: "8 minutes",
    followUpRequired: false,
  },
]

export function CrisisTracking({ dateRange }: CrisisTrackingProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "monitoring":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "active":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Crisis intervention data is highly sensitive. Access is logged and monitored. Only authorized personnel should
          view this information.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium">Total Interventions</span>
          </div>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-muted-foreground">This period</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Avg Response Time</span>
          </div>
          <p className="text-2xl font-bold">4.2 min</p>
          <p className="text-xs text-muted-foreground">Target: &lt;5 min</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Resolution Rate</span>
          </div>
          <p className="text-2xl font-bold">92%</p>
          <p className="text-xs text-muted-foreground">Successfully resolved</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">Follow-ups</span>
          </div>
          <p className="text-2xl font-bold">3</p>
          <p className="text-xs text-muted-foreground">Requiring monitoring</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Crisis Events</h3>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Phone className="mr-2 h-4 w-4" />
            Emergency Contacts
          </Button>
        </div>

        <div className="space-y-4">
          {crisisEvents.map((event) => (
            <div key={event.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className={getSeverityColor(event.severity)}>
                    {event.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(event.status)}>
                    {event.status.toUpperCase()}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {event.timestamp.toLocaleDateString()} {event.timestamp.toLocaleTimeString()}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Response Time:</span>
                  <span className="ml-2">{event.responseTime}</span>
                </div>
                <div>
                  <span className="font-medium">Follow-up Required:</span>
                  <span className="ml-2">{event.followUpRequired ? "Yes" : "No"}</span>
                </div>
                <div>
                  <span className="font-medium">Event ID:</span>
                  <span className="ml-2 font-mono">#{event.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Crisis Prevention Resources</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Emergency Contacts</h4>
            <div className="text-sm space-y-1">
              <p>Crisis Hotline: 988</p>
              <p>Campus Emergency: (555) 123-4567</p>
              <p>Campus Counseling: (555) 123-4568</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Response Protocol</h4>
            <div className="text-sm space-y-1">
              <p>1. Immediate safety assessment</p>
              <p>2. Connect to crisis counselor</p>
              <p>3. Follow-up within 24 hours</p>
              <p>4. Document and report</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
