// middleware.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request) {
    // Define protected routes
    const protectedRoutes = ['/dashboard', '/profile', '/admin'];
    const authRoutes = ['/auth/login', '/auth/register'];

    const { pathname } = request.nextUrl;

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Check if the current path is an auth route
    const isAuthRoute = authRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Get the token from cookies
    const token = request.cookies.get('access_token')?.value;

    // If it's a protected route and no token exists, redirect to login
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // If token exists, verify it
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

            // If user is authenticated and trying to access auth routes, redirect to dashboard
            if (isAuthRoute) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }

            // Add user info to request headers for use in server components
            const response = NextResponse.next();
            response.headers.set('x-user-id', decoded.id.toString());
            response.headers.set('x-user-email', decoded.email);
            response.headers.set('x-user-role', decoded.role || 'user');

            return response;
        } catch (error) {
            // Token is invalid, clear it and redirect to login if accessing protected route
            const response = isProtectedRoute
                ? NextResponse.redirect(new URL('/auth/login', request.url))
                : NextResponse.next();

            // Clear the invalid token
            response.cookies.set('access_token', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 0
            });

            return response;
        }
    }

    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
