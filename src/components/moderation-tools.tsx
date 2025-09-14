"use client"

import { useState, useEffect } from "react"
// CORRECTED: Added 'getDoc' and 'increment' to the list of imports
import { collection, query, where, onSnapshot, getDocs, doc, updateDoc, deleteDoc, Timestamp, collectionGroup, getDoc, increment } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flag, Eye, CheckCircle, X, AlertTriangle, ShieldCheck } from "lucide-react"
import { auth, db } from '../lib/firebase-config'
import { useToast } from "./ui/use-toast"
import Link from "next/link"

interface ForumPost {
  id: string; title: string; authorUsername: string; content: string; timestamp: Timestamp; flags: number; category: string; riskLevel?: string; status: 'pending' | 'approved' | 'rejected';
}
interface ReportedReply {
  id: string;
  content: string;
  authorUsername: string;
  postId: string;
  postTitle: string;
}

export function ModerationTools() {
  const [pendingPosts, setPendingPosts] = useState<ForumPost[]>([]);
  const [reportedReplies, setReportedReplies] = useState<ReportedReply[]>([]);
  const [stats, setStats] = useState({ pending: 0, reported: 0, approvedToday: 0, highRisk: 0 });
  const [loading, setLoading] = useState(true);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => { if (user) { const adminQuery = query(collection(db, "admins"), where("uid", "==", user.uid)); const querySnapshot = await getDocs(adminQuery); if (!querySnapshot.empty) { const adminDoc = querySnapshot.docs[0]; setCollegeId(adminDoc.id); } else { setLoading(false); } } else { setLoading(false); } }); return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!collegeId) return;

    const postsRef = collection(db, "forumPosts");
    const pendingQuery = query(postsRef, where("collegeId", "==", collegeId), where("status", "==", "pending"));
    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));
      setPendingPosts(posts);
      setStats(prev => ({ ...prev, pending: snapshot.size }));
      setLoading(false);
    });

    const repliesQuery = query(collectionGroup(db, 'replies'), where("status", "==", "reported"));
    const unsubscribeReplies = onSnapshot(repliesQuery, async (snapshot) => {
        const fetchedReplies: ReportedReply[] = [];
        for (const replyDoc of snapshot.docs) {
            const postRef = replyDoc.ref.parent.parent;
            if (postRef) {
                const postSnap = await getDoc(postRef);
                if (postSnap.exists() && postSnap.data().collegeId === collegeId) {
                    fetchedReplies.push({
                        id: replyDoc.id,
                        content: replyDoc.data().content,
                        authorUsername: replyDoc.data().authorUsername,
                        postId: postRef.id,
                        postTitle: postSnap.data().title
                    });
                }
            }
        }
        setReportedReplies(fetchedReplies);
        setStats(prev => ({ ...prev, reported: fetchedReplies.length }));
    });

    return () => {
      unsubscribePending();
      unsubscribeReplies();
    };
  }, [collegeId]);

  const handleApprove = async (postId: string) => {
    const postRef = doc(db, "forumPosts", postId);
    try {
      await updateDoc(postRef, { status: "approved" });
      toast({ title: "Success", description: "Post has been approved." });
    } catch (error) { toast({ title: "Error", description: "Could not approve post.", variant: "destructive" }); }
  };

  const handleReject = async (postId: string) => {
    const postRef = doc(db, "forumPosts", postId);
    try {
      await deleteDoc(postRef); 
      toast({ title: "Success", description: "Post has been rejected and deleted." });
    } catch (error) { toast({ title: "Error", description: "Could not reject post.", variant: "destructive" }); }
  };
  
  const handleDismissReply = async (postId: string, replyId: string) => {
    const replyRef = doc(db, "forumPosts", postId, "replies", replyId);
    try {
        await updateDoc(replyRef, { status: "visible" });
        toast({ title: "Success", description: "Reply has been dismissed and is now visible." });
    } catch (error) { toast({ title: "Error", description: "Could not dismiss reply.", variant: "destructive" }); }
  };

  const handleDeleteReply = async (postId: string, replyId: string) => {
      const replyRef = doc(db, "forumPosts", postId, "replies", replyId);
      const postRef = doc(db, "forumPosts", postId);
      try {
          await deleteDoc(replyRef);
          await updateDoc(postRef, { replies: increment(-1) });
          toast({ title: "Success", description: "Reply has been deleted permanently." });
      } catch (error) { toast({ title: "Error", description: "Could not delete reply.", variant: "destructive" }); }
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center space-x-2 mb-2"><Eye className="h-5 w-5 text-blue-600" /><span>Pending Review</span></div><p className="text-2xl font-bold">{stats.pending}</p><p className="text-xs text-muted-foreground">Posts awaiting approval</p></Card>
            <Card className="p-4"><div className="flex items-center space-x-2 mb-2"><Flag className="h-5 w-5 text-red-600" /><span>Reported Content</span></div><p className="text-2xl font-bold">{stats.reported}</p><p className="text-xs text-muted-foreground">Replies awaiting review</p></Card>
            <Card className="p-4"><div className="flex items-center space-x-2 mb-2"><CheckCircle className="h-5 w-5 text-green-600" /><span>Approved Today</span></div><p className="text-2xl font-bold">{stats.approvedToday}</p><p className="text-xs text-muted-foreground">Posts approved</p></Card>
            <Card className="p-4"><div className="flex items-center space-x-2 mb-2"><AlertTriangle className="h-5 w-5 text-orange-600" /><span>High Risk</span></div><p className="text-2xl font-bold">{stats.highRisk}</p><p className="text-xs text-muted-foreground">Require immediate review</p></Card>
        </div>

        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Posts Pending Review</h3>
            <div className="space-y-4">
            {loading ? ( <p>Loading posts...</p> ) : pendingPosts.length > 0 ? (
                pendingPosts.map((post) => (
                  <div key={post.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3"><div className="flex-1"><div className="flex items-center space-x-2 mb-2"><h4 className="font-medium">{post.title}</h4><Badge variant="outline" className={getRiskColor(post.riskLevel)}>{post.riskLevel ? post.riskLevel.toUpperCase() : 'N/A'}</Badge>{post.flags > 0 && ( <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{post.flags} flags</Badge> )}</div><p className="text-sm text-muted-foreground mb-2"> By {post.authorUsername} • {post.timestamp?.toDate().toLocaleTimeString()} • {post.category} </p><p className="text-sm">{post.content}</p></div></div>
                    <div className="flex items-center space-x-2"><Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(post.id)}><CheckCircle className="mr-1 h-3 w-3" />Approve</Button><Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent" onClick={() => handleReject(post.id)}><X className="mr-1 h-3 w-3" />Reject</Button></div>
                  </div>
                ))
            ) : ( <p className="text-muted-foreground">No posts are currently pending review.</p> )}
            </div>
        </Card>

        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Reported Replies</h3>
            <div className="space-y-4">
            {loading ? (<p>Loading reported content...</p>) : reportedReplies.length > 0 ? (
                reportedReplies.map((reply) => (
                <div key={reply.id} className="border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                        Reply by <span className="font-medium">{reply.authorUsername}</span> on post: <a href={`/forum/${reply.postId}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{reply.postTitle}</a>
                    </p>
                    <p className="text-sm bg-muted p-3 rounded-md">"{reply.content}"</p>
                    <div className="flex items-center space-x-2 mt-3">
                        <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent" onClick={() => handleDismissReply(reply.postId, reply.id)}><ShieldCheck className="mr-1 h-3 w-3" />Dismiss</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteReply(reply.postId, reply.id)}><X className="mr-1 h-3 w-3" />Delete Reply</Button>
                    </div>
                </div>
                ))
            ) : (<p className="text-muted-foreground">No replies are currently reported.</p>)}
            </div>
        </Card>
    </div>
  )
}