import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

const privateRoutes = ["/profile"];
const adminRoutes = ["/dashboard"];

export async function middleware(request) {
    const response = (await middlewareAuth(request)) ?? NextResponse.next();

    // Update User Session Expiration
    await updateUserSessionExpiration({
        set: (key, value, options) => {
            response.cookies.set({ ...options, name: key, value })
        },
        get: key => request.cookies.get(key),
    })

    return response;
}

async function middlewareAuth(request) {
    const pathname = request.nextUrl.pathname;

    // Check private routes
    if (privateRoutes.includes(pathname)) {
        const user = await getUserFromSession(request.cookies);
        if (!user) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    }

    // Check admin routes
    if (adminRoutes.includes(pathname)) {
        const user = await getUserFromSession(request.cookies);
        if (!user) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
        if (!checkUserRole(user, ['admin'])) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }
}

/**
 * Get user from JWT session cookie
 * @param {RequestCookies} cookies - Next.js request cookies
 * @returns {Object|null} User object or null if invalid/expired
 */
async function getUserFromSession(cookies) {
    try {
        const token = cookies.get('access_token')?.value;

        if (!token) {
            return null;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            return null;
        }

        return {
            email: decoded.email,
            role: decoded.role || 'user',
            client: decoded.client,
            iat: decoded.iat,
            exp: decoded.exp
        };
    } catch (error) {
        console.error('Error verifying JWT token in middleware:', error.message);
        return null;
    }
}

/**
 * Check if user role matches required roles
 * @param {Object} user - User object with role property
 * @param {Array} requiredRoles - Array of required roles
 * @returns {boolean} True if user has required role
 */
function checkUserRole(user, requiredRoles = []) {
    if (!user || !user.role) {
        return false;
    }

    // Admin always has access
    if (user.role === 'admin') {
        return true;
    }

    // Check if user role is in required roles
    return requiredRoles.includes(user.role);
}

/**
 * Update user session expiration by refreshing JWT token
 * @param {Object} cookieManager - Object with get/set methods for cookie management
 */
async function updateUserSessionExpiration(cookieManager) {
    try {
        const tokenCookie = cookieManager.get('access_token');
        const token = tokenCookie?.value;

        if (!token) {
            return;
        }

        // Decode without verification first to get payload
        const decoded = jwt.decode(token);
        if (!decoded) {
            return;
        }

        // Verify token is still valid
        try {
            jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (error) {
            // Token is invalid or expired, don't refresh
            return;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const tokenExp = decoded.exp;

        // Only refresh if token is in the last 25% of its lifetime
        // This prevents constant token refreshing
        const tokenLifetime = tokenExp - decoded.iat;
        const refreshThreshold = tokenExp - (tokenLifetime * 0.25);

        if (currentTime >= refreshThreshold) {
            // Determine new expiration based on original token lifetime
            const originalLifetimeHours = tokenLifetime / 3600;
            const isRememberMe = originalLifetimeHours > 24 * 14; // More than 14 days suggests "remember me"

            // Create new token with same payload but fresh expiration
            const newToken = jwt.sign(
                {
                    email: decoded.email,
                    client: decoded.client,
                    role: decoded.role || 'user'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: isRememberMe ? '30d' : '7d' }
            );

            // Set the new token as cookie
            cookieManager.set('access_token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: (isRememberMe ? 30 : 7) * 24 * 60 * 60 * 1000
            });
        }
    } catch (error) {
        console.error('Error updating session expiration:', error.message);
    }
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    ],
};
