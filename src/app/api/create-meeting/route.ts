// src/app/api/create-meeting/route.ts (More Robust Version)

import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.WHEREBY_API_KEY;

  if (!apiKey) {
    console.error("WHEREBY_API_KEY is not configured in .env.local");
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }

  try {
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 2);
    
    // ❗ Double-check this URL for any typos
    const wherebyEndpoint = "https://api.whereby.com/v1/meetings";

    const response = await fetch(wherebyEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endDate: endDate.toISOString(),
        roomMode: "group",
        fields: ["hostRoomUrl"],
      }),
    });

    // 🔧 MODIFIED: Better error handling
    if (!response.ok) {
      // Get the raw text of the response
      const errorText = await response.text();
      console.error("Whereby API returned an error. Status:", response.status);
      console.error("Raw Error Response:", errorText); // This will show us the HTML
      
      // Try to parse as JSON, but don't crash if it's not
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch (e) {
        errorDetails = { message: "Response was not valid JSON.", content: errorText };
      }

      return NextResponse.json({ error: 'Failed to create meeting', details: errorDetails }, { status: response.status });
    }

    const meetingData = await response.json();
    
    return NextResponse.json({ 
      participantUrl: meetingData.roomUrl, 
      hostUrl: meetingData.hostRoomUrl 
    });

  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}