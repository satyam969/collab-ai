import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  console.log('Middleware running for:', pathname);

 
  if (
    pathname.startsWith('/signup')||
    pathname.startsWith('/login') || 
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next/static') || 
    pathname.startsWith('/favicon.ico') 
  ) {
    return NextResponse.next();
  }

  console.log('Request Cookies:', req.cookies);

const session = req.cookies.get('__Secure-next-auth.session-token');

  console.log("mil gay hai cookie ",session);

  

 
  if (session) {
    return NextResponse.next();
  }


  const loginUrl = new URL('/login', req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|favicon.ico).*)', 
  ],
};
