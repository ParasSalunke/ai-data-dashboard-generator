import { NextResponse, type NextRequest } from 'next/server';

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    const hasDatasetId = req.nextUrl.searchParams.has('id');
    const userId = req.cookies.get('firebase_user_id')?.value;
    if (!userId && !hasDatasetId) {
      return NextResponse.redirect(new URL('/', req.url));
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
