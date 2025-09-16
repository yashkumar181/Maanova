import { Timestamp } from "firebase/firestore";

export interface Post {
  id: string;
  title: string;
  content: string;
  authorUsername: string;
  isAnonymous: boolean;
  category: string;
  tags: string[];
  timestamp: Timestamp | Date; // Can be a Firebase Timestamp or a JS Date
  replies: number;
  likes: number;
  isModerated: boolean;
  // Add other optional fields if they exist
  isPinned?: boolean;
  [key: string]: any;
}