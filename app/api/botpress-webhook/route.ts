import { db } from "@/lib/firebase";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { user, conversation, type } = body;
    
    // We will only log new messages sent by the user
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

    // Add the message to a Firestore collection
    await db.collection('chatbot_messages').add(messageData);

    return NextResponse.json({ message: 'Data received and logged successfully.' });

  } catch (error) {
    console.error('Error logging data from Botpress:', error);
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 });
  }
}
