import * as admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Firebase Admin app once
const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log("Firebase Admin Initialized successfully.");
    } catch (error) {
      console.error('Firebase admin initialization error', (error as Error).stack);
    }
  }
};

initializeFirebaseAdmin();
const db = admin.firestore();

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { user, conversation, type } = body;
    
    if (type !== 'message_sent' || user.id === 'botpress-bot') {
      return NextResponse.json({ message: 'Event ignored.' }, { status: 200 });
    }
    
    const messageData = {
      userId: user.id,
      conversationId: conversation.id,
      message: body.message.text,
      timestamp: new Date(),
      source: 'botpress',
    };

    await db.collection('chatbot_messages').add(messageData);

    return NextResponse.json({ message: 'Data received and logged successfully.' });

  } catch (error) {
    console.error('Error logging data from Botpress:', error);
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 });
  }
}
