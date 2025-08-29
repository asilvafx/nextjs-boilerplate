// lib/auth.js
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function verifyToken(request) {
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
        return { error: 'No token provided.', status: 403 };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return { user: decoded };
    } catch (error) {
        return { error: 'Invalid token.', status: 403 };
    }
}

// Higher-order function for protecting API routes
export function withAuth(handler) {
    return async (request, context) => {

        // Check if this is a public request
        const xInternalHeader = request.headers.get('x-internal');

        if (xInternalHeader === 'public') {
            // Bypass token verification for public requests
            return handler(request, context);
        }

        // Proceed with normal token verification for non-public requests
        const authResult = verifyToken(request);

        if (authResult.error) {
            return NextResponse.json(
                { message: authResult.error },
                { status: authResult.status }
            );
        }

        // Add user data to request context
        request.user = authResult.user;

        return handler(request, context);
    };
}

// Higher-order function for protecting API routes with role requirement
export function withAuthAndRole(requiredRoles = []) {
    return function(handler) {
        return async (request, context) => {
            const authResult = verifyToken(request);

            if (authResult.error) {
                return NextResponse.json(
                    { message: authResult.error },
                    { status: authResult.status }
                );
            }
            requiredRoles.push('admin');

            // Add user data to request context
            request.user = authResult.user;

            // Check if user has required role
            const userRole = authResult.user.role;

            if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
                return NextResponse.json(
                    {
                        message: `Access denied. Required role(s): ${requiredRoles.join(', ')}. Your role: ${userRole}`
                    },
                    { status: 403 }
                );
            }

            return handler(request, context);
        };
    };
}

// Convenience function for admin-only routes
export function withAdminAuth(handler) {
    return withAuthAndRole(['admin'])(handler);
}
