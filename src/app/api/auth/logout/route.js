// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth.js';

async function logoutHandler(request) {
    try {
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully!'
        });

        // Clear the access token cookie
        response.cookies.set('access_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0 // Expire immediately
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Logout failed.' },
            { status: 500 }
        );
    }
}

export const POST = withAuth(logoutHandler);
