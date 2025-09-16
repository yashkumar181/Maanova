"use client";

// Your existing imports...

import { PeerSupportForum } from "@/components/peer-support-forum";
import { useAuth } from "@/hooks/useAuth";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Skeleton } from "@/components/ui/skeleton";
// --- 1. IMPORT useMemo FROM REACT ---
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Post } from '@/types';
import { CreatePostModal } from "@/components/create-post-modal";
import { Card } from "@/components/ui/card";
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

  const categories = ['Depression', 'Relationships', 'Cheating', 'Anxiety', 'Stress', 'Exams'];

  useEffect(() => {
    // This useEffect hook remains the same...
    if (!user) {
      setCollegeId(null);
      return;
    };
    const fetchUserData = async () => {
      const studentRef = doc(db, "students", user.uid);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        setCollegeId(studentSnap.data()?.collegeId);
      }
    };
    const fetchPosts = async () => {
      const postsCollectionRef = collection(db, 'forumPosts');
      const q = query(postsCollectionRef, where("status", "==", "approved"), orderBy("timestamp", "desc"));
      const data = await getDocs(q);
      setAllPosts(data.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post)));
    };
    fetchUserData();
    fetchPosts();
  }, [user]);

  // --- 2. ADD THIS BLOCK TO EFFICIENTLY CALCULATE COUNTS ---
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    // Loop through each post
    for (const post of allPosts) {
      // Loop through each tag within a post
      for (const tag of post.tags) {
        // If the tag exists in our categories list, increment its count
        if (categories.includes(tag)) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      }
    }
    return counts;
  }, [allPosts, categories]); // This only recalculates when posts or categories change

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
      <div className="max-w-7xl mx-auto"> {/* Adjusted for a wider layout */}
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
            {/* --- Main Grid Layout --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

              {/* --- Left Column --- */}
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
                {/* You can add the "Forum Stats" card here later */}
              </aside>

              {/* --- Right Column --- */}
              <section className="md:col-span-3">
                {/* You can add the "Search Bar" here later */}
                <PeerSupportForum posts={filteredPosts} />
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
