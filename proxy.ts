// proxy.ts
import { decrypt } from '@/lib/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ambil cookie
  const sessionCookie = request.cookies.get('auth_session')?.value;
  
  // 2. Validasi payload (Cek jika session tidak kosong string "")
  const payload = (sessionCookie && sessionCookie !== "") 
    ? await decrypt(sessionCookie) 
    : null;

  const isLoginPage = pathname === '/login';
  const isRootPath = pathname === '/';
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/program') || 
    pathname.startsWith('/log') || 
    pathname.startsWith('/users');

  // --- LOGIKA REDIRECT ---

  // A. Handling Root Path
  if (isRootPath) {
    return NextResponse.redirect(new URL(payload ? '/dashboard' : '/login', request.url));
  }

  // B. Anti-Loop untuk Halaman Login
  if (isLoginPage) {
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next(); // Izinkan akses login jika tidak ada payload
  }

  // C. Proteksi Halaman Dalam
  if (isProtectedRoute && !payload) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    // Pastikan cookie benar-benar bersih di sisi client
    response.cookies.delete('auth_session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/program/:path*',
    '/log/:path*',
    '/users/:path*',
  ],
};