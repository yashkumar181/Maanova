"use client";
import { ForumPost } from "./forum-post";
import { Card } from "@/components/ui/card";
import { Post } from '@/types'; // Adjust path if needed

// 1. Define the props the component will accept
interface PeerSupportForumProps {
  posts: Post[];
}

// 2. The component now accepts 'posts' as a prop
export const PeerSupportForum: React.FC<PeerSupportForumProps> = ({ posts }) => {

  // 3. All internal state and useEffect hooks for fetching data have been removed.

  return (
    <div className="space-y-4">
      {/* If there are no posts, show a message */}
      {posts.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
              <p>No posts found for this category. Be the first to start a conversation!</p>
          </Card>
      )}

      {/* 4. Map over the 'posts' array from props to display each one */}
      {posts.map((post) => (
        <ForumPost key={post.id} post={post} />
      ))}
    </div>
  );
}
