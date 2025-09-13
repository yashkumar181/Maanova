"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Headphones, FileText, ExternalLink, BookOpen } from "lucide-react"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

// This interface now perfectly matches the one in resource-hub.tsx
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'video' | 'audio' | 'article' | 'guide' | 'tool';
  category: string;
}

interface ResourceCardProps {
  resource: Resource;
  userUid: string | null;
  collegeId: string | null;
}

export function ResourceCard({ resource, userUid, collegeId }: ResourceCardProps) {
  
  const getTypeIcon = () => {
    switch (resource.type) {
      case "video": return <Video className="h-5 w-5" />;
      case "audio": return <Headphones className="h-5 w-5" />;
      case "article": return <FileText className="h-5 w-5" />;
      case "guide": return <BookOpen className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const logResourceAccess = async () => {
    if (!userUid || !collegeId) return;

    try {
      await addDoc(collection(db, "resourceAccessLogs"), {
        resourceId: resource.id,
        resourceTitle: resource.title,
        studentUid: userUid,
        collegeId: collegeId,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error logging resource access:", error);
    }
  };

  const handleResourceClick = () => {
    logResourceAccess();
    window.open(resource.url, "_blank", "noopener,noreferrer");
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 text-primary">
            {getTypeIcon()}
            <span className="text-sm font-medium capitalize">{resource.type}</span>
          </div>
          <Badge variant="secondary" className="text-xs">{resource.category}</Badge>
        </div>

        <h3 className="font-semibold text-lg mb-2 leading-tight">{resource.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{resource.description}</p>
      </div>

      <div className="p-6 pt-0 mt-auto">
        <Button onClick={handleResourceClick} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Resource
        </Button>
      </div>
    </Card>
  )
}

