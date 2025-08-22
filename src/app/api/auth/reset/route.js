// app/api/auth/reset/route.js
import { NextResponse } from 'next/server';
import DBService from '@/data/rest.db.js';
import { encryptHash } from '@/lib/crypto.js';

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
        const { email, newPassword, confirmPassword } = await request.json();

        // Validation
        if (!email || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { error: 'Email and passwords are required.' }
            );
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { error: 'Passwords must match.' }
            );
        }

        if (!passwordValid(newPassword)) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters with lowercase and one uppercase or number.' }
            );
        }

        const user = await DBService.readBy("email", email.toLowerCase(), "users");
        if (!user) {
            return NextResponse.json(
                { error: 'User not found.' }
            );
        }

        // Get the user's key to update the record
        const userKey = await DBService.getItemKey("email", email.toLowerCase(), "users");
        if (!userKey) {
            return NextResponse.json(
                { error: 'Unable to update password.' }
            );
        }

        const updatedUser = {
            ...user,
            password: encryptHash(newPassword)
        };

        await DBService.update(userKey, updatedUser, "users");

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully. You can now log in.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Failed to update password.' },
            { status: 500 }
        );
    }
}
