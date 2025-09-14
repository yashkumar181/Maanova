"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Clock, Pin, Flag, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { db } from "@/lib/firebase"
// CORRECTED: Added all necessary imports from firestore
import { doc, updateDoc, increment, collection, onSnapshot, writeBatch, query, where, QuerySnapshot } from "firebase/firestore"
import Link from "next/link"

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

interface ForumPostProps {
  post: Post
}

export function ForumPost({ post }: ForumPostProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  // CORRECTED: This useEffect now correctly sets up the real-time listener for likes
  useEffect(() => {
    if (!user) return;
    
    // Define the collection of 'likes' for this specific post
    const likesRef = collection(db, "forumPosts", post.id, "likes");
    // Create a query to find a 'like' from the current user
    const q = query(likesRef, where("userId", "==", user.uid));

    // Set up the real-time listener
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
      // If the snapshot is not empty, it means the user has liked this post
      setIsLiked(!snapshot.empty);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [user, post.id]);

  // This effect keeps the like count in sync with the database
  useEffect(() => {
    const postRef = doc(db, "forumPosts", post.id);
    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        setLikeCount(doc.data().likes || 0);
      }
    });
    return () => unsubscribe();
  }, [post.id]);
  
  const handleLike = async () => {
    if (!user) return;
    const postRef = doc(db, "forumPosts", post.id);
    const likeRef = doc(collection(db, "forumPosts", post.id, "likes"), user.uid);

    try {
      const batch = writeBatch(db);
      if (isLiked) {
        batch.delete(likeRef);
        batch.update(postRef, { likes: increment(-1) });
      } else {
        batch.set(likeRef, { userId: user.uid });
        batch.update(postRef, { likes: increment(1) });
      }
      await batch.commit();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <Card className={`p-4 sm:p-6 hover:shadow-md transition-shadow ${post.isPinned ? "border-primary/50 bg-primary/5" : ""}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {post.isAnonymous ? "?" : post.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{post.author}</span>
                {post.isModerated && <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Verified</Badge>}
                {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{getTimeAgo(post.timestamp)}</span>
                <span>•</span>
                <span>{post.category}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Flag className="mr-2 h-4 w-4" />Report Post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2 leading-tight">{post.title}</h3>
          <p className="text-muted-foreground leading-relaxed line-clamp-3">{post.content}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (<Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
              disabled={!user}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm">{likeCount}</span>
            </Button>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.replies} replies</span>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="bg-transparent">
            <Link href={`/forum/${post.id}`}>View Discussion</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}