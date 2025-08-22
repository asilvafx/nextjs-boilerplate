// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import DBService from '@/data/rest.db.js';
import { encryptHash } from '@/lib/crypto.js';
import EmailService from '@/lib/email.js';

const passwordValid = (pwd) => {
    return (
        pwd.length >= 8 &&
        pwd.length <= 32 &&
        /[a-z]/.test(pwd) &&
        /[A-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)
    );
};

export async function POST(request) {

    const authHeader = request.headers.get("x-internal-secret");

    if (authHeader !== process.env.NEXT_PUBLIC_API_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, email, password } = await request.json();

        // Validation
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Name, Email and Password are required.' }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format.' }
            );
        }

        const passwordHash = atob(password);

        if (!passwordValid(passwordHash)) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters with lowercase and one uppercase or number.' }
            );
        }

        const inpEmail = email.toLowerCase();
        const existingUser = await DBService.readBy("email", inpEmail, "users");

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered.' }
            );
        }

        const encryptedPassword = encryptHash(passwordHash);
        const timeNow = new Date().toLocaleString();

        await DBService.create({
            displayName: name,
            email: inpEmail,
            password: encryptedPassword,
            created_at: timeNow
        }, "users");

        // Send welcome email
        try {
            await EmailService.sendWelcomeEmail(inpEmail, name);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }

        return NextResponse.json({
            success: true,
            message: 'Account created successfully!'
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Registration failed.' },
            { status: 500 }
        );
    }
}
