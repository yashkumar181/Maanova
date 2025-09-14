"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
// UPDATED: Added deleteDoc
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, increment, Timestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { ForumPost } from "@/components/forum-post";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox"; // NEW: Import Checkbox
import { Label } from "@/components/ui/label"; // NEW: Import Label
import { ArrowLeft, Trash2 } from "lucide-react"; // NEW: Import Trash2 icon
import { useToast } from "@/components/ui/use-toast";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  isAnonymous: boolean;
  category: string;
  tags: string[];
  timestamp: Date;
  replies: number;
  likes: number;
  isModerated: boolean;
  isPinned?: boolean;
}

interface Reply {
  id: string;
  content: string;
  authorUsername: string;
  authorUid: string; // NEW: Needed to check for ownership
  isAnonymous: boolean; // NEW: Needed to display author correctly
  timestamp: Date;
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymousReply, setIsAnonymousReply] = useState(false); // NEW: State for the checkbox

  useEffect(() => {
    if (!postId) return;

    const postRef = doc(db, "forumPosts", postId);
    const unsubscribePost = onSnapshot(postRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPost({
          id: docSnap.id, ...data,
          author: data.isAnonymous ? "Anonymous" : data.authorUsername,
          timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
        } as Post);
      } else { router.push("/forum"); }
      setLoading(false);
    });

    const repliesRef = collection(db, "forumPosts", postId, "replies");
    const repliesQuery = query(repliesRef, orderBy("timestamp", "asc"));
    const unsubscribeReplies = onSnapshot(repliesQuery, (snapshot) => {
      const fetchedReplies = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, ...data,
          // UPDATED: Display "Anonymous" if the flag is set
          authorUsername: data.isAnonymous ? "Anonymous" : data.authorUsername,
          timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
        }
      }) as Reply[];
      setReplies(fetchedReplies);
    });

    return () => {
      unsubscribePost();
      unsubscribeReplies();
    };
  }, [postId, router]);

  const handleAddReply = async () => {
    if (!user || !replyContent.trim()) return;
    setIsSubmitting(true);
    try {
        const studentRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentRef);
        if (!studentSnap.exists()) throw new Error("Student profile not found.");
        
        const authorUsername = studentSnap.data().username;

        const repliesRef = collection(db, "forumPosts", postId, "replies");
        await addDoc(repliesRef, {
            content: replyContent,
            authorUid: user.uid,
            authorUsername: authorUsername, // Always store the real username
            isAnonymous: isAnonymousReply, // Store the anonymous flag
            timestamp: serverTimestamp(),
        });

        const postRef = doc(db, "forumPosts", postId);
        await updateDoc(postRef, { replies: increment(1) });

        setReplyContent("");
        setIsAnonymousReply(false); // Reset checkbox
        toast({ title: "Success", description: "Your reply has been posted." });
    } catch (error) {
        console.error("Error adding reply:", error);
        toast({ title: "Error", description: "Could not post your reply.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  // NEW: Function to handle deleting a reply
  const handleDeleteReply = async (replyId: string) => {
    if (!window.confirm("Are you sure you want to delete this reply? This action cannot be undone.")) {
      return;
    }
    try {
      const replyRef = doc(db, "forumPosts", postId, "replies", replyId);
      await deleteDoc(replyRef);

      const postRef = doc(db, "forumPosts", postId);
      await updateDoc(postRef, { replies: increment(-1) });

      toast({ title: "Success", description: "Your reply has been deleted." });
    } catch (error) {
        console.error("Error deleting reply:", error);
        toast({ title: "Error", description: "Could not delete your reply.", variant: "destructive" });
    }
  };

  if (loading || !post) {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
            <Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" />
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.push('/forum')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forum
        </Button>

        <ForumPost post={post} />

        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Replies ({replies.length})</h2>
            <div className="space-y-4">
                {replies.map(reply => (
                    <Card key={reply.id} className="p-4">
                        <div className="flex items-start space-x-3">
                            <Avatar className="h-8 w-8"><AvatarFallback>{reply.authorUsername.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-semibold">{reply.authorUsername}</span>
                                      <span className="text-xs text-muted-foreground">{reply.timestamp.toLocaleString()}</span>
                                    </div>
                                    {/* NEW: Show delete button only to the author of the reply */}
                                    {user && user.uid === reply.authorUid && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteReply(reply.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-foreground mt-1">{reply.content}</p>
                            </div>
                        </div>
                    </Card>
                ))}
                {replies.length === 0 && <p className="text-center text-muted-foreground py-8">Be the first to reply.</p>}
            </div>

            {user && (
                <Card className="mt-8">
                    <CardHeader><h3 className="text-lg font-semibold">Add Your Reply</h3></CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Share your thoughts and support..." rows={4} />
                        {/* NEW: Checkbox for anonymous replies */}
                        <div className="flex items-center space-x-2">
                            <Checkbox id="anonymous" checked={isAnonymousReply} onCheckedChange={(checked) => setIsAnonymousReply(checked as boolean)} />
                            <Label htmlFor="anonymous" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Post anonymously</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleAddReply} disabled={isSubmitting || !replyContent.trim()}>{isSubmitting ? "Posting..." : "Post Reply"}</Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    </div>
  );
}