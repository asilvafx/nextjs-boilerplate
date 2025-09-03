// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import DBService from '@/data/rest.db.js';
import { encryptHash, encryptPassword, generateSalt } from '@/lib/crypto.js';
import EmailService from '@/lib/email.js';
import jwt from 'jsonwebtoken';
import { createWallet, loadConfig } from '@/lib/web3';

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
        const { name, email, password, client } = await request.json();

        // Validation
        if(!client) {
            return NextResponse.json(
                { error: 'Invalid request: Client mismatch.' }
            );
        }
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

        const salt = generateSalt();
        const encryptedPassword = await encryptPassword(passwordHash, salt);

        const timeNow = new Date().toLocaleString();

        let userRegisterData = {
            displayName: name,
            email: inpEmail,
            password: encryptedPassword,
            salt: salt,
            role: 'user',
            created_at: timeNow
        };

        // Load Web3
        const web3load = loadConfig.WEB3_ACTIVE;
        if(web3load){
            const salt = generateSalt();
            const web3create = await createWallet();
            if(web3create?.web3?.address && web3create?.web3?.privateKey){
                const web3data = {
                    salt: salt,
                    public_key: web3create.address,
                    private_key: encryptPassword(web3create.privateKey, salt)
                }
                userRegisterData = {
                    ...userRegisterData,
                    web3: web3data
                };
            }
        }

        await DBService.create(userRegisterData, "users");

        const { salt: _salt, password: _password, ...userWithoutPassword } = userRegisterData;

        // Send welcome email
        try {
            await EmailService.sendWelcomeEmail(inpEmail, name);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }

        // Create JWT token
        const token = jwt.sign(
            {
                email: inpEmail,
                client: client,
                role: 'user' // Include role if available
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' } // Token expires in 7 days
        );

        // Create the response
        const response = NextResponse.json({
            success: true,
            user: userWithoutPassword,
            userData: encryptHash(userWithoutPassword),
            message: 'Register successful!'
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
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Registration failed.' },
            { status: 500 }
        );
    }
}
