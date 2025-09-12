"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ForumPost } from "./forum-post";
import { CommunityGuidelines } from "./community-guidelines";
import { CreatePostModal } from "./create-post-modal"; // We will use the updated modal
import { Search, Plus, Shield } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { db, auth } from "@/lib/firebase";
import { useToast } from "./ui/use-toast";

// This interface should match the one in forum-post.tsx
interface Post {
  id: string;
  title: string;
  content: string;
  author: string; // This will now be "Anonymous" if isAnonymous is true
  isAnonymous: boolean;
  category: string;
  tags: string[];
  timestamp: Date; // Use Date object
  replies: number;
  likes: number;
  isModerated: boolean;
  isPinned?: boolean;
}

export function PeerSupportForum() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch the student's collegeId from their document
        const studentRef = doc(db, "students", currentUser.uid);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          setCollegeId(studentSnap.data()?.collegeId);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!collegeId) {
        // If there's no collegeId, don't try to fetch posts
        setLoading(false);
        return;
    }

    const postsQuery = query(
      collection(db, "forumPosts"),
      where("collegeId", "==", collegeId),
      where("status", "==", "approved"), // Only show approved posts
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // *** THIS IS THE KEY TO ANONYMITY ***
        // We check the isAnonymous flag and change the author name here
        author: doc.data().isAnonymous ? "Anonymous" : doc.data().authorUsername,
        timestamp: (doc.data().timestamp as Timestamp).toDate(),
      })) as Post[];
      setPosts(fetchedPosts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collegeId]);
  
  const handleCreatePostClick = () => {
      if (!user) {
          toast({ title: "Login Required", description: "You must be logged in to create a post.", variant: "destructive"});
          return;
      }
      setIsCreatePostOpen(true);
  }

  // Your filtering and sorting logic can remain the same
  // ...

  return (
    <div className="space-y-6">
      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription>
          This is a safe, moderated space. Please be respectful and follow our community guidelines.
        </AlertDescription>
      </Alert>
      
      <Card className="p-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Community Feed</h2>
            <Button onClick={handleCreatePostClick}>
              <Plus className="mr-2 h-4 w-4" /> New Post
            </Button>
        </div>
      </Card>

      {loading && <p>Loading posts...</p>}
      
      {!loading && posts.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
              <p>No posts yet. Be the first to start a conversation!</p>
          </Card>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <ForumPost key={post.id} post={post} />
        ))}
      </div>

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        collegeId={collegeId}
        userUid={user?.uid || null}
      />
      {/* Your CommunityGuidelines modal can stay here */}
    </div>
  );
}
