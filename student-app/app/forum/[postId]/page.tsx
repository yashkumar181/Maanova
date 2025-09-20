"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, increment, Timestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { ForumPost } from "@/components/forum-post";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, Flag } from "lucide-react"; // Import Flag icon
import { useToast } from "@/components/ui/use-toast";

// ... (Interfaces for Post and Reply remain the same)
interface Post { id: string; title: string; content: string; author: string; isAnonymous: boolean; category: string; tags: string[]; timestamp: Date; replies: number; likes: number; isModerated: boolean; isPinned?: boolean; }
interface Reply { id: string; content: string; authorUsername: string; authorUid: string; isAnonymous: boolean; timestamp: Date; }

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId as string;
  const router = useRouter();
  const { user, role } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymousReply, setIsAnonymousReply] = useState(false);

  useEffect(() => {
    // ... (This useEffect for fetching data remains the same)
    if (!postId) return;
    const postRef = doc(db, "forumPosts", postId);
    const unsubscribePost = onSnapshot(postRef, (docSnap) => { if (docSnap.exists()) { const data = docSnap.data(); setPost({ id: docSnap.id, ...data, author: data.isAnonymous ? "Anonymous" : data.authorUsername, timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(), } as Post); } else { router.push("/forum"); } setLoading(false); });
    const repliesRef = collection(db, "forumPosts", postId, "replies");
    const repliesQuery = query(repliesRef, orderBy("timestamp", "asc"));
    const unsubscribeReplies = onSnapshot(repliesQuery, (snapshot) => { const fetchedReplies = snapshot.docs.map(doc => { const data = doc.data(); return { id: doc.id, ...data, authorUsername: data.isAnonymous ? "Anonymous" : data.authorUsername, timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(), } }) as Reply[]; setReplies(fetchedReplies); });
    return () => { unsubscribePost(); unsubscribeReplies(); };
  }, [postId, router]);

  const handleAddReply = async () => {
    // ... (This function remains mostly the same)
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
            authorUsername: authorUsername, 
            isAnonymous: isAnonymousReply, 
            timestamp: serverTimestamp(),
            status: "visible" // NEW: Add initial status
        });
        const postRef = doc(db, "forumPosts", postId);
        await updateDoc(postRef, { replies: increment(1) });
        setReplyContent("");
        setIsAnonymousReply(false);
        toast({ title: "Success", description: "Your reply has been posted." });
    } catch (error) {
        console.error("Error adding reply:", error);
        toast({ title: "Error", description: "Could not post your reply.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    // ... (This function remains the same)
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    try {
      const replyRef = doc(db, "forumPosts", postId, "replies", replyId);
      await deleteDoc(replyRef);
      const postRef = doc(db, "forumPosts", postId);
      await updateDoc(postRef, { replies: increment(-1) });
      toast({ title: "Success", description: "Reply has been deleted." });
    } catch (error) {
        console.error("Error deleting reply:", error);
        toast({ title: "Error", description: "Could not delete the reply.", variant: "destructive" });
    }
  };

  // NEW: Function to handle reporting a reply
  const handleReportReply = async (replyId: string) => {
    if (!window.confirm("Are you sure you want to report this reply as inappropriate?")) return;
    try {
        const replyRef = doc(db, "forumPosts", postId, "replies", replyId);
        await updateDoc(replyRef, { status: "reported" });
        toast({ title: "Thank You", description: "This reply has been reported for review." });
    } catch (error) {
        console.error("Error reporting reply:", error);
        toast({ title: "Error", description: "Could not report this reply.", variant: "destructive" });
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
                                    <div className="flex items-center">
                                      {/* NEW: Report button for all users (except the author) */}
                                      {user && user.uid !== reply.authorUid && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleReportReply(reply.id)}>
                                            <Flag className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                      )}
                                      {/* Delete button for author or admin */}
                                      {(user && (user.uid === reply.authorUid || role === 'admin')) && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteReply(reply.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      )}
                                    </div>
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
                        <div className="flex items-center space-x-2">
                            <Checkbox id="anonymous" checked={isAnonymousReply} onCheckedChange={(checked) => setIsAnonymousReply(checked as boolean)} />
                            <Label htmlFor="anonymous" className="text-sm font-medium leading-none">Post anonymously</Label>
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