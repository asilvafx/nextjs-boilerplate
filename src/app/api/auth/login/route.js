// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import DBService from '@/data/rest.db.js';
import { encryptHash, encryptPassword, validatePassword, generateSalt } from '@/lib/crypto.js';
import jwt from 'jsonwebtoken';
import { createWallet, loadConfig } from '@/lib/web3';

export async function POST(request) {
    const authHeader = request.headers.get("x-internal-secret");

    if (authHeader !== process.env.NEXT_PUBLIC_API_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { email, password, rememberMe, client } = await request.json();

        // Validation
        if(!client) {
            return NextResponse.json(
                { error: 'Invalid request: Client mismatch.' }
            );
        }
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

        const passwordValidated = await validatePassword(atob(password), user.salt, user.password);

        if (!user || !passwordValidated) {
            return NextResponse.json(
                { error: 'Invalid credentials.' }
            );
        }

        // User validated

        let userLoginData = {
            ...user,
            client: client
        };

        // Load Web3
        const web3load = await loadConfig.WEB3_ACTIVE;
        if(web3load){
            const web3user = user.web3_pk || null;
            if(!web3user){
                const salt = generateSalt();
                const web3create = await createWallet();
                if(web3create?.web3?.address && web3create?.web3?.privateKey){
                    const web3data = {
                        salt: salt,
                        public_key: web3create.address,
                        private_key: encryptPassword(web3create.privateKey, salt)
                    }
                    userLoginData = {
                        ...userLoginData,
                        web3: web3data
                    };
                    const userId = await DBService.getItemKey('email', user.email, 'users');

                    await DBService.update(userId, {web3: web3data}, 'users');
                }
            }
        }

        // Remove password from response
        const { salt: _salt, password: _password, ...userWithoutPassword } = user;

        // Create JWT token
        const token = jwt.sign(
            {
                email: user.email,
                client: client,
                role: user.role || 'user' // Include role if available
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: rememberMe ? '30d' : '7d' } // Token expires in 7 days
        );


        // Create the response
        const response = NextResponse.json({
            success: true,
            user: userWithoutPassword,
            userData: encryptHash(userWithoutPassword),
            message: 'Login successful!'
        });

        // Set HTTP-only cookie with JWT token
        response.cookies.set('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000 // 7 or 30 days in milliseconds
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
