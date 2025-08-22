// app/api/auth/forgot/route.js
import { NextResponse } from 'next/server';
import DBService from '@/data/rest.db.js';
import { encryptHash } from '@/lib/crypto.js';
import EmailService from '@/lib/email.js';

export async function POST(request) {

    const authHeader = request.headers.get("x-internal-secret");

    if (authHeader !== process.env.NEXT_PUBLIC_API_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        const { email } = await request.json();

        // Validation
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Enter a valid email.' }
            );
        }

        const address = email.toLowerCase();
        const user = await DBService.readBy("email", address, "users");

        if (!user) {
            return NextResponse.json(
                { error: 'Email not found in our records.' }
            );
        }

        // Generate 6-digit code
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        const encryptedCode = encryptHash(randomCode);

        // Send password reset email
        try {
            await EmailService.sendPasswordResetEmail(
                address,
                randomCode,
                user.displayName
            );

            console.log(`Reset code sent to ${address}: ${randomCode}`);
        } catch (emailError) {
            console.error('Email service error:', emailError);
            return NextResponse.json(
                { error: 'Failed to send reset email. Please try again.' }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Code sent to ${address}. Please check your email inbox and spam folders.`,
            // Remove this in production - only for demo
            demoCode: randomCode,
            encryptedCode: encryptedCode
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Error sending code.' },
            { status: 500 }
        );
    }
}
