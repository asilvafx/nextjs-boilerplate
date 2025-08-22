// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import DBService from '@/data/rest.db.js';
import { encryptHash, decryptHash } from '@/lib/crypto.js';

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

        const userEncrypted = encryptHash(userWithoutPassword);

        return NextResponse.json({
            success: true,
            user: userWithoutPassword,
            userEncrypted: userEncrypted,
            message: 'Login successful!'
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed.' },
            { status: 500 }
        );
    }
}
