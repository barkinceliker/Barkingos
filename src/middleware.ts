
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

console.log("Middleware: ABSOLUTELY MINIMAL version - Module loaded.");

// This is the simplest possible middleware function.
// It will run on the Edge runtime by default and match all paths
// because there is no config.
export function middleware(request: NextRequest) {
  console.log(`Middleware: ABSOLUTELY MINIMAL version - Path: ${request.nextUrl.pathname}`);
  return NextResponse.next();
}

// No config object exported
// No runtime exported
