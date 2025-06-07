
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuration for the middleware
export const config = {
  // Match all paths to ensure Next.js attempts to load this middleware
  matcher: '/:path*',
};

// Explicitly set the runtime to Node.js
// This can sometimes resolve loading issues if the Edge runtime has complications
// in specific environments, even for simple middleware.
export const runtime = 'nodejs';

export function middleware(request: NextRequest) {
  // This log will only appear if Next.js successfully loads and executes the middleware
  console.log(`Middleware (Node.js runtime) executed for path: ${request.nextUrl.pathname}`);
  return NextResponse.next();
}
