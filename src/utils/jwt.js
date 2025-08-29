// lib/jwtUtils.js
import jwt from 'jsonwebtoken';
import { decryptHash } from '../lib/crypto';

export function parseJWTFromCookie(cookieValue) {
    try {
        if (!cookieValue) return null;

        // Decode JWT (without verification for client-side)
        const decoded = jwt.decode(cookieValue);

        if (!decoded || !decoded.data) return null;

        // Check expiration
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            return null; // Token expired
        }

        // Decrypt user data
        const userData = decryptHash(decoded.data);
        return userData;

    } catch (error) {
        console.error('Error parsing JWT from cookie:', error);
        return null;
    }
}

export function isTokenExpired(token) {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
}
