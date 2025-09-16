// src/app/api/create-meeting/route.ts (Updated to fix 'any' type)

import { NextResponse } from 'next/server';

// This function gets an access token from Zoom
async function getZoomAccessToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom credentials are not configured in .env.local');
  }

  const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Zoom Auth Error:", errorData);
    throw new Error('Failed to get Zoom access token');
  }

  const data = await response.json();
  return data.access_token;
}

// This is the main API route that the dashboard calls
export async function POST() {
  try {
    const accessToken = await getZoomAccessToken();

    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: "Counseling Session",
        type: 2, // Scheduled meeting
        start_time: new Date().toISOString(),
        duration: 45, // in minutes
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Zoom Meeting Creation Error:", errorData);
      throw new Error('Failed to create Zoom meeting');
    }

    const meetingData = await response.json();

    return NextResponse.json({
      participantUrl: meetingData.join_url,
      hostUrl: meetingData.start_url,
    });

  // 🔧 MODIFIED: This catch block is updated to be type-safe
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    // Safely check if the error is an actual Error object
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error("Internal Server Error:", errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}