import { NextResponse } from 'next/server';

// This is a list of all the websites you trust to use this API.
const allowedOrigins = [
  'http://localhost:3001', // Your local admin dashboard
  'https://admin-dashboard-ivory-alpha-36.vercel.app' // THIS IS THE FIX: Your deployed admin dashboard URL
];

// This function checks if the request is coming from an allowed origin
const getCorsHeaders = (origin: string | null) => {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
};

// This function handles "preflight" requests that browsers send first
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin)
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const headers = getCorsHeaders(origin);

  if (!process.env.WHEREBY_API_KEY) {
    console.error("Server Error: WHEREBY_API_KEY is not defined in environment variables.");
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500, headers });
  }

  try {
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 2); // Meeting is valid for 2 hours

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
      throw new Error('Failed to create meeting room in Whereby.');
    }

    const meetingData = await response.json();
    const meetingLinks = {
      meetingUrl: meetingData.roomUrl,
      hostUrl: meetingData.hostRoomUrl,
    };

    return NextResponse.json(meetingLinks, { headers });

  } catch (error) {
    console.error("Error in /api/create-meeting:", error);
    return NextResponse.json({ error: 'Failed to create meeting.' }, { status: 500, headers });
  }
}