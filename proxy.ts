import { decrypt } from '@/lib/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('auth_session')?.value;
  
  const payload = (sessionCookie && sessionCookie !== "") 
    ? await decrypt(sessionCookie) 
    : null;

  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  const isWaitingPage = pathname === '/waiting';
  const isRootPath = pathname === '/';
  
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/program') || 
    pathname.startsWith('/log') || 
    pathname.startsWith('/users') ||
    pathname.startsWith('/reporting');

  if (!payload) {
    if (isLoginPage || isRegisterPage) return NextResponse.next();
    
    if (isRootPath || isProtectedRoute || isWaitingPage) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      if (sessionCookie) response.cookies.delete('auth_session');
      return response;
    }
    return NextResponse.next();
  }
  
  if (!payload.hasName) {
    if (isRegisterPage) return NextResponse.next();
    return NextResponse.redirect(new URL('/register', request.url));
  }

  if (payload.is_guest === true) {
    if (isWaitingPage) return NextResponse.next();
    
    if (isProtectedRoute || isRegisterPage || isLoginPage || isRootPath) {
      return NextResponse.redirect(new URL('/waiting', request.url));
    }
  } 
  
  if (payload.is_guest === false) {
    if (isWaitingPage || isLoginPage || isRegisterPage || isRootPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};