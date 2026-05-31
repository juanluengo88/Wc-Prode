import { NextResponse } from 'next/server';

// Returns the server's current UTC timestamp in milliseconds.
// Used by the client to anchor its lock-time calculations so they can't be
// spoofed by changing the local system clock.
export async function GET() {
  return NextResponse.json({ utc: Date.now() });
}
