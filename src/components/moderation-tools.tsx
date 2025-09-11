"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flag, Eye, CheckCircle, X, MessageCircle, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { collection, getFirestore, query, where, Timestamp, Firestore, onSnapshot, getDocs, orderBy } from 'firebase/firestore';
import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  console.warn("Please check your .env.local file for correct Firebase credentials.");
}

// Define the shape of your data documents
interface ForumPost {
  id: string;
  title: string;
  author: string;
  content: string;
  timestamp: Timestamp;
  flags: number;
  category: string;
  riskLevel: string;
  status: string;
  isReported?: boolean;
  collegeId: string;
}

export function ModerationTools() {
  const [pendingPosts, setPendingPosts] = useState<ForumPost[]>([]);
  const [reportedContent, setReportedContent] = useState<ForumPost[]>([]);
  const [approvedTodayCount, setApprovedTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [collegeId, setCollegeId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || !db) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDocRef = collection(db, "admins");
          const q = query(adminDocRef, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const adminDoc = querySnapshot.docs[0];
            const fetchedCollegeId = adminDoc.id;
            setCollegeId(fetchedCollegeId);
          } else {
            console.error("No admin document found for this user.");
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        }
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db]);


  useEffect(() => {
    if (!db || !collegeId) return;

    setLoading(true);

    const pendingQuery = query(
      collection(db, "forumPosts"),
      where("collegeId", "==", collegeId),
      where("status", "==", "pending"),
      orderBy("timestamp", "desc")
    );

    const reportedQuery = query(
      collection(db, "forumPosts"),
      where("collegeId", "==", collegeId),
      where("isReported", "==", true),
      orderBy("timestamp", "desc")
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const approvedTodayQuery = query(
        collection(db, "forumPosts"),
        where("collegeId", "==", collegeId),
        where("status", "==", "approved"),
        where("timestamp", ">=", Timestamp.fromDate(todayStart))
    );
    

    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ForumPost));
      setPendingPosts(posts);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching pending posts:", error);
        setLoading(false);
    });

    const unsubscribeReported = onSnapshot(reportedQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ForumPost));
      setReportedContent(posts);
    }, (error) => {
        console.error("Error fetching reported content:", error);
    });

    const unsubscribeApproved = onSnapshot(approvedTodayQuery, (snapshot) => {
        setApprovedTodayCount(snapshot.size);
    }, (error) => {
        console.error("Error fetching approved count:", error);
    });

    return () => {
      unsubscribePending();
      unsubscribeReported();
      unsubscribeApproved();
    };
  }, [db, collegeId]);

  const getRiskColor = (level: string) => {
    switch (level) {
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
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading moderation tools...</div>;
  }
  
  if (!collegeId) {
    return <div className="text-center p-8 text-red-600">Please log in to view this section.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Pending Review</span>
          </div>
          <p className="text-2xl font-bold">{pendingPosts.length}</p>
          <p className="text-xs text-muted-foreground">Posts awaiting approval</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Flag className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium">Reported Content</span>
          </div>
          <p className="text-2xl font-bold">{reportedContent.length}</p>
          <p className="text-xs text-muted-foreground">Requires attention</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Approved Today</span>
          </div>
          <p className="text-2xl font-bold">{approvedTodayCount}</p>
          <p className="text-xs text-muted-foreground">Posts approved</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium">High Risk</span>
          </div>
          <p className="text-2xl font-bold">{pendingPosts.filter(post => post.riskLevel === 'high').length}</p>
          <p className="text-xs text-muted-foreground">Require immediate review</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Posts Pending Review</h3>
        <div className="space-y-4">
          {pendingPosts.map((post) => (
            <div key={post.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{post.title}</h4>
                    <Badge variant="outline" className={getRiskColor(post.riskLevel)}>
                      {post.riskLevel.toUpperCase()}
                    </Badge>
                    {post.flags > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {post.flags} flags
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    By {post.author} • {post.timestamp.toDate().toLocaleTimeString()} • {post.category}
                  </p>
                  <p className="text-sm">{post.content}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                >
                  <X className="mr-1 h-3 w-3" />
                  Reject
                </Button>
                <Button size="sm" variant="outline" className="bg-transparent">
                  <MessageCircle className="mr-1 h-3 w-3" />
                  Contact User
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Reported Content</h3>
        <div className="space-y-4">
          {reportedContent.map((report) => (
            <div key={report.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{report.status.toUpperCase()}</Badge>
                  <span className="text-sm font-medium">{report.title}</span>
                </div>
                <Badge
                  variant="outline"
                  className={getStatusColor(report.status)}
                >
                  {report.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Reported by {report.author} • {report.timestamp.toDate().toLocaleString()}
              </p>
              {report.status === "pending" && (
                <div className="flex items-center space-x-2 mt-3">
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <Eye className="mr-1 h-3 w-3" />
                    Review
                  </Button>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
