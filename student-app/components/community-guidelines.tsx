"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Shield, Heart, Users, AlertTriangle, CheckCircle } from "lucide-react"

interface CommunityGuidelinesProps {
  isOpen: boolean
  onClose: () => void
}

export function CommunityGuidelines({ isOpen, onClose }: CommunityGuidelinesProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Community Guidelines</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <p className="text-sm leading-relaxed">
              Our peer support forum is a safe space for college students to connect, share experiences, and support
              each other. These guidelines help maintain a respectful and helpful community for everyone.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Heart className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800 mb-1">Be Kind and Supportive</h3>
                <p className="text-sm text-muted-foreground">
                  Treat others with empathy and respect. Remember that everyone is going through their own challenges.
                  Offer encouragement and avoid judgment.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Respect Privacy and Anonymity</h3>
                <p className="text-sm text-muted-foreground">
                  Don't try to identify anonymous users or share personal information about others. Respect people's
                  choice to remain anonymous.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-primary mb-1">Share Constructively</h3>
                <p className="text-sm text-muted-foreground">
                  Share your experiences and coping strategies that might help others. Focus on what has worked for you
                  rather than giving direct medical advice.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Crisis Situations</h3>
                <p className="text-sm text-muted-foreground">
                  If you're in crisis, please contact emergency services (911) or the crisis hotline (988) immediately.
                  While our community is supportive, we cannot provide emergency mental health services.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What's Not Allowed:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Harassment, bullying, or discriminatory language</li>
              <li>• Sharing personal contact information</li>
              <li>• Promoting self-harm or dangerous behaviors</li>
              <li>• Spam, advertising, or off-topic content</li>
              <li>• Providing specific medical or psychiatric advice</li>
              <li>• Sharing graphic details of self-harm or trauma</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Moderation</h3>
            <p className="text-sm text-green-700">
              Our trained student moderators review posts to ensure community safety. Posts may be edited or removed if
              they violate guidelines. Moderators are available to help and can connect you with additional resources.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              I Understand
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
