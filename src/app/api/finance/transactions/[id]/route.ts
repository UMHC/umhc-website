import { NextResponse } from 'next/server';

export async function PUT() {
  // Temporary redirect to under-development page
  // This finance API is not currently in use but may be picked up in the future
  return NextResponse.redirect(new URL('/under-development', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'), 302);
}

export async function DELETE() {
  // Temporary redirect to under-development page
  // This finance API is not currently in use but may be picked up in the future
  return NextResponse.redirect(new URL('/under-development', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'), 302);
}

// Removed edge runtime - using default Node.js runtime
export const revalidate = 0; // No caching for redirects