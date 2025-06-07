
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a no-op middleware. It allows all requests to pass through.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// By not specifying any paths in the matcher, or keeping it empty,
// this middleware won't be actively invoked for specific routes.
// Next.js requires this file to export a valid middleware function if the file exists.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * This was the default matcher from a previous version.
     * For a true "no-op" where middleware does nothing and applies to nothing,
     * an empty array is better: matcher: []
     * Or you can remove the config object entirely if you want it to apply to all paths
     * (but still do nothing).
     *
     * Given the intent to remove previous auth logic, an empty matcher is safest.
     */
    //  '/((?!api|_next/static|_next/image|favicon.ico).*)' // Example of a broader matcher
  ],
};
