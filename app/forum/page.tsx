"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, doc, getDoc, onSnapshot } from 'firebase/firestore'; // Import onSnapshot for real-time updates
import { useAuth } from "@/hooks/useAuth";
import { PeerSupportForum } from "@/components/peer-support-forum";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryFilter } from '@/components/CategoryFilter';
import { Post } from '@/types';
import { CreatePostModal } from "@/components/create-post-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ForumPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState(true);

  const categories = ['Depression', 'Relationships', 'Cheating', 'Anxiety', 'Stress', 'Exams'];

  // 👇 UPDATED: This useEffect now fetches the collegeId, then sets up a real-time listener for posts.
  useEffect(() => {
    if (!user) {
      setPostsLoading(false);
      return;
    };

    const fetchUserDataAndSubscribeToPosts = async () => {
      const studentRef = doc(db, "students", user.uid);
      const studentSnap = await getDoc(studentRef);
      
      if (studentSnap.exists()) {
        const studentCollegeId = studentSnap.data()?.collegeId;
        setCollegeId(studentCollegeId);

        if (studentCollegeId) {
          // This query now filters posts by the student's collegeId
          const postsCollectionRef = collection(db, 'forumPosts');
          const q = query(
            postsCollectionRef, 
            where("collegeId", "==", studentCollegeId), // The crucial filter
            where("status", "==", "approved"), 
            orderBy("timestamp", "desc")
          );

          // Use onSnapshot for real-time updates
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
            setAllPosts(posts);
            setPostsLoading(false);
          });

          return unsubscribe; // Return the unsubscribe function for cleanup
        }
      }
      setPostsLoading(false); // Also stop loading if no collegeId is found
    };

    const unsubscribePromise = fetchUserDataAndSubscribeToPosts();

    return () => {
        unsubscribePromise.then(unsubscribe => {
            if (unsubscribe) {
                unsubscribe();
            }
        });
    };
  }, [user]);

  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    for (const post of allPosts) {
      if(post.tags) {
        for (const tag of post.tags) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      }
    }
    return counts;
  }, [allPosts]);

  const handleCreatePostClick = () => {
      if (!user) {
          toast({ title: "Login Required", description: "You must be logged in to create a post.", variant: "destructive"});
          return;
      }
      setIsCreatePostOpen(true);
  }

  const filteredPosts = selectedCategory === 'all'
    ? allPosts
    : allPosts.filter(post => post.tags && post.tags.includes(selectedCategory));

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Peer Support Community</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Connect with fellow students in a safe, moderated environment.
          </p>
        </div>
        
        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : user ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <aside className="md:col-span-1 space-y-6">
                <Button onClick={handleCreatePostClick} size="lg" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> New Post
                </Button>
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  categoryCounts={categoryCounts}
                  totalPostsCount={allPosts.length}
                />
              </aside>

              <section className="md:col-span-3">
                {postsLoading ? (
                    <Skeleton className="h-96 w-full" />
                ) : (
                    <PeerSupportForum posts={filteredPosts} />
                )}
              </section>
            </div>
            
            <CreatePostModal
              isOpen={isCreatePostOpen}
              onClose={() => setIsCreatePostOpen(false)}
              collegeId={collegeId}
              userUid={user?.uid || null}
            />
          </>
        ) : (
          <LoginPrompt message="You need to be logged in to view the forum and connect with peers." />
        )}
      </div>
    </main>
  );
}