// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import DBService from '@/data/rest.db.js';
import { decryptHash } from '@/lib/crypto.js';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    const authHeader = request.headers.get("x-internal-secret");

    if (authHeader !== process.env.NEXT_PUBLIC_API_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { email, password } = await request.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and Password are required.' }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format.' }
            );
        }

        const inpEmail = email.toLowerCase();
        const user = await DBService.readBy("email", inpEmail, "users");

        if (!user || decryptHash(user.password) !== atob(password)) {
            return NextResponse.json(
                { error: 'Invalid credentials.' }
            );
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        // Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role || 'user' // Include role if available
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' } // Token expires in 7 days
        );

        // Create the response
        const response = NextResponse.json({
            success: true,
            user: userWithoutPassword,
            message: 'Login successful!'
        });

        // Set HTTP-only cookie with JWT token
        response.cookies.set('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed.' },
            { status: 500 }
        );
    }
}
