import { NextResponse } from 'next/server';

// This is a list of all the websites you trust to use this API.
// For development, we'll add your local admin dashboard address.
// For production, you would add your deployed admin dashboard's URL.
const allowedOrigins = [
  'http://localhost:3000', // Add the port your ADMIN dashboard runs on
  'https://admin-dashboard-ivory-alpha-36.vercel.app/' // Example for production
];

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigins.join(', '),
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// This function handles preflight requests that browsers send for CORS

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function POST(request: Request) {
  if (!process.env.WHEREBY_API_KEY) {
    return NextResponse.json({ error: 'Server configuration error: Missing API key.' }, { status: 500, headers: corsHeaders });
  }

  try {
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 2);

    const response = await fetch('https://api.whereby.dev/v1/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHEREBY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endDate: endDate.toISOString(),
        fields: ['hostRoomUrl'],
        roomNamePattern: 'uuid',
        roomMode: 'group',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Whereby API Error:', errorBody);
      throw new Error('Failed to create meeting room.');
    }

    const meetingData = await response.json();
    const meetingLinks = {
      meetingUrl: meetingData.roomUrl,
      hostUrl: meetingData.hostRoomUrl,
    };

    // Return the response with the CORS headers included
    return NextResponse.json(meetingLinks, { headers: corsHeaders });

  } catch (error) {
    console.error(error);
    // Return the error response with the CORS headers included
    return NextResponse.json({ error: 'Failed to create meeting.' }, { status: 500, headers: corsHeaders });
  }
}