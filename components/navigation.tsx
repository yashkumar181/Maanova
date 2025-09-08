import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Calendar, BookOpen, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export function Navigation() {
  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">MindCare</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Chat Support</span>
              </Button>
            </Link>
            <Link href="/booking">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Book Counselor</span>
              </Button>
            </Link>
            <Link href="/resources">
              <Button variant="ghost" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Resources</span>
              </Button>
            </Link>
            <Link href="/forum">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Peer Support</span>
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            </Link>
          </div>

          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Help Now</Button>
        </div>
      </div>
    </nav>
  )
}
