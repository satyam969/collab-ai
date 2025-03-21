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


  const session = req.cookies.get('next-auth.session-token'); 
  

 
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
