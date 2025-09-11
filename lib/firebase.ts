import * as admin from 'firebase-admin';

// Check if the Firebase Admin app has already been initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
console.log('Firebase admin initialization error', (error as Error).stack);  }
}

const db = admin.firestore();
export { db };
