// app/api/auth/verify/route.js
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth.js';

async function verifyHandler(request) {
    try {
        // If we reach here, the token is valid (verified by withAuth middleware)
        const { user } = request;

        return NextResponse.json({
            success: true,
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json(
            { success: false, valid: false, error: 'Internal server error.' },
            { status: 500 }
        );
    }
}

export const GET = withAuth(verifyHandler);
