// app/api/auth/verify/route.js
import { NextResponse } from 'next/server';
import { decryptHash } from '@/lib/crypto.js';

export async function POST(request) {
    
    const authHeader = request.headers.get("x-internal-secret");

    if (authHeader !== process.env.NEXT_PUBLIC_API_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { code, encryptedCode } = await request.json();

        if (!code || !encryptedCode) {
            return NextResponse.json(
                { error: 'Code and encrypted code are required.' }
            );
        }

        if (code !== decryptHash(encryptedCode)) {
            return NextResponse.json(
                { error: 'Invalid code.' }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Code verified successfully.'
        });

    } catch (error) {
        console.error('Code verification error:', error);
        return NextResponse.json(
            { error: 'Error verifying code.' },
            { status: 500 }
        );
    }
}

