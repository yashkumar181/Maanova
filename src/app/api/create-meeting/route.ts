// src/app/api/create-meeting/route.ts

import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.WHEREBY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }

  try {
    // Set the meeting to end 2 hours from now
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 2);

    const response = await fetch("https://api.whereby.com/v1/meetings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endDate: endDate.toISOString(),
        roomMode: "group", // Creates a temporary room
        fields: ["hostRoomUrl"], // Ask the API to include the host link in the response
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Whereby API Error:", errorData);
      return NextResponse.json({ error: 'Failed to create meeting' }, { status: response.status });
    }

    const meetingData = await response.json();
    
    // Return both the student link (roomUrl) and counselor link (hostRoomUrl)
    return NextResponse.json({ 
      participantUrl: meetingData.roomUrl, 
      hostUrl: meetingData.hostRoomUrl 
    });

  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}