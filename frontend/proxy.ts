import { NextResponse, type NextRequest } from 'next/server';

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all dashboard routes — require authentication
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const userId = req.cookies.get('firebase_user_id')?.value;
    if (!userId) {
      const loginUrl = new URL('/', req.url);
      loginUrl.searchParams.set('auth', 'required');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API routes
    '/(api|trpc)(.*)',
  ],
};
