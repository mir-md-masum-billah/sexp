// C:\Users\Admin\Desktop\sexp\middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
    const token = await getToken({ req: request });
    const isAuthenticated = !!token;

    const path = request.nextUrl.pathname;
    const isLoginPage = path === '/login';
    const isHomePage = path === '/home';
    const isRootPage = path === '/';

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/home', '/'];

    // Check if the route is protected
    const isProtectedRoute = !publicRoutes.some(route =>
        path === route || path.startsWith('/api/')
    );

    // Redirect to login if not authenticated and trying to access protected routes
    if (!isAuthenticated && isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', path);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to home if authenticated and on login page
    if (isAuthenticated && isLoginPage) {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    // For root page, redirect to home
    if (isRootPage) {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/profile/:path*',
        '/upload/:path*',
        '/reels/:path*',
        '/login',
        '/',
        '/home'
    ],
};