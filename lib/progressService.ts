// In lib/progressService.ts

import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// This lock lives outside of any component, so it persists across re-renders.
const submissionLock = {
  isSubmitting: false,
};

export const saveProgressResponse = async (
  studentId: string,
  questionnaireType: string,
  score: number,
  individualResponses: Record<string, number>
) => {
  // 1. Check the lock. If it's busy, stop immediately.
  if (submissionLock.isSubmitting) {
    console.log("Submission already in progress. Aborting duplicate save.");
    return;
  }

  try {
    // 2. Activate the lock.
    submissionLock.isSubmitting = true;

    const studentDocRef = doc(db, "students", studentId); 
    const studentDocSnap = await getDoc(studentDocRef);

    if (!studentDocSnap.exists()) {
      console.error("Could not find student profile data.");
      return; // Return here, but the 'finally' block will still run
    }

    const studentProfile = studentDocSnap.data();

    const responseData = {
      studentId: studentId,
      collegeId: studentProfile.collegeId,
      studentYear: studentProfile.yearOfStudy,
      studentDept: studentProfile.department,
      questionnaireType: questionnaireType,
      score: score,
      individualResponses: individualResponses,
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, "progressResponses"), responseData);
    console.log(`✅ Success! Progress response saved.`);

  } catch (error) {
    console.error("🔥 Error saving progress response: ", error);
  } finally {
    // 3. IMPORTANT: Release the lock, no matter what happens.
    // This allows the user to try again if the submission failed.
    submissionLock.isSubmitting = false;
  }
};