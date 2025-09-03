import CryptoJS from 'crypto-js';
import crypto from "crypto";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || 'your-default-secret-key'; // Secure key management

const CryptoJSAesJson = {

    stringify: function (cipherParams) {

        try {
        const j = {ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)};
        if (cipherParams.iv) j.iv = cipherParams.iv.toString();
        if (cipherParams.salt) j.s = cipherParams.salt.toString();
        return JSON.stringify(j);
        } catch (error) {
            return null;
        }
    },
    parse: function (jsonStr) {
        try {
        if (!isValidJson(jsonStr)) return null;
        const j = JSON.parse(jsonStr);
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(j.ct)
        });
        if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv);
        if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s);
        return cipherParams;
        } catch (error) {
            return null;
        }
    }
};

function isValidJson(str) {
    if (typeof str !== "string") return false;
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

export const encryptHash = (password) => {
    return CryptoJS.AES.encrypt(JSON.stringify(password), secretKey, {
        format: CryptoJSAesJson
    }).toString();
};

export const decryptHash = (encryptedPassword) => {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedPassword, secretKey, {
            format: CryptoJSAesJson
        }).toString(CryptoJS.enc.Utf8);

        if (!decrypted) {
            throw new Error('Decryption failed');
        }

        return JSON.parse(decrypted);
    } catch (error) {
        throw new Error('Decryption error: ' + error);
    }
};

export async function encryptPassword(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password.normalize(), salt, 64, (error, hash) => {
            if (error) return reject(error);
            resolve(hash.toString("hex").normalize());
        });
    });
}

export async function validatePassword({ password, salt, hashedPassword }) {
    const inputHashedPassword = await encryptPassword(password, salt);

    return crypto.timingSafeEqual(
        Buffer.from(inputHashedPassword, "hex"),
        Buffer.from(hashedPassword, "hex")
    );
}

export function generateSalt() {
    return crypto.randomBytes(16).toString("hex").normalize();
}
