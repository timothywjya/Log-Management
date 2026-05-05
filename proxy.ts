/**
 * PROXY — Next.js Route Protection
 * Menggantikan middleware.ts
 * Validasi JWT, redirect logic, admin-only paths + CSRF mutations.
 */

import { decrypt } from '@/lib/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ADMIN_PATHS = ['/admin', '/api/admin'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('auth_session')?.value;

  const payload = (sessionCookie && sessionCookie !== '')
    ? await decrypt(sessionCookie)
    : null;

  const isLoginPage    = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  const isWaitingPage  = pathname === '/waiting';
  const isRootPath     = pathname === '/';

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/program') ||
    pathname.startsWith('/log') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/reporting') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/profile');

  // ── Unauthenticated ─────────────────────────────────
  if (!payload) {
    if (isLoginPage || isRegisterPage) return NextResponse.next();
    if (isRootPath || isProtectedRoute || isWaitingPage) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      if (sessionCookie) response.cookies.delete('auth_session');
      return response;
    }
    return NextResponse.next();
  }

  // ── Profile incomplete ───────────────────────────────
  if (!payload.hasName) {
    if (isRegisterPage) return NextResponse.next();
    return NextResponse.redirect(new URL('/register', request.url));
  }

  // ── Guest user ──────────────────────────────────────
  if (payload.is_guest === true) {
    if (isWaitingPage) return NextResponse.next();
    if (isProtectedRoute || isRegisterPage || isLoginPage || isRootPath) {
      return NextResponse.redirect(new URL('/waiting', request.url));
    }
  }

  // ── Active user ──────────────────────────────────────
  if (payload.is_guest === false) {
    if (isWaitingPage || isLoginPage || isRegisterPage || isRootPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Admin-only path guard
    if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && !payload.is_admin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // ── CSRF for API mutations ───────────────────────────
  if (
    pathname.startsWith('/api/') &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
  ) {
    const csrfHeader = request.headers.get('x-csrf-token');
    const csrfCookie = request.cookies.get('csrf_token')?.value;
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 });
    }
  }

  // Inject user context headers
  const res = NextResponse.next();
  res.headers.set('x-user-nik',      payload.nik ?? '');
  res.headers.set('x-user-is-admin', String(payload.is_admin ?? false));

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
