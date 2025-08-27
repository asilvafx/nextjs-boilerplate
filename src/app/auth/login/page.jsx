"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Turnstile from "react-turnstile";
import { motion } from "framer-motion";
import Link from "next/link";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useAuth } from "@/hooks/useAuth.js";

const TurnstileKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_API || null;

const LoginPage = () => {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [isTurnstileVerified, setIsTurnstileVerified] = useState(false);

    useEffect(() => {
        if (isAuthenticated) router.push("/dashboard");

        // Check for email in URL params (from reset password redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const emailParam = urlParams.get('email');
        if (emailParam) {
            setEmail(decodeURIComponent(emailParam));
        }
    }, [isAuthenticated, router]);

    const showPassword = () => setShowPwd((prev) => !prev);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (TurnstileKey && !isTurnstileVerified) {
            toast.error('Please complete the verification.');
            return;
        }
        setLoading(true);

        try {
            const passwordHash = btoa(password);
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "x-internal-secret": process.env.NEXT_PUBLIC_API_KEY,
                },
                body: JSON.stringify({
                    email,
                    password: passwordHash
                }),
                credentials: 'include' // Important: Include cookies in the request
            });

            const data = await response.json();

            if (!data.success) {
                toast.error(data.error);
                setLoading(false);
                return;
            }

            // Update Redux state with user data
            login(data.user);

            // Note: No need to manually set cookies - JWT token is set as HTTP-only cookie by the server

            toast.success(data.message);
            router.push("/");
        } catch (error) {
            toast.error("Login failed.");
            console.error(error);
            setLoading(false);
        }
    };

    if(isAuthenticated){
        return null;
    }

    return (
        <div className="section screen sm">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sign In</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Welcome back! Please sign in to your account.
                </p>
            </div>

            <motion.form
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleLogin}
            >
                <div>
                    <label className="block font-semibold text-slate-10 mb-2">Email</label>
                    <div className="flex items-center border rounded-xl px-3 h-12 focus-within:border-blue-500">
                        <input
                            disabled={loading}
                            type="email"
                            placeholder="Enter your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-none outline-none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block font-semibold text-slate-10 mb-2">Password</label>
                    <div className="flex items-center border rounded-xl px-3 h-12 focus-within:border-blue-500">
                        <input
                            disabled={loading}
                            type={showPwd ? "text" : "password"}
                            placeholder="Enter your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-none outline-none"
                            required
                        />
                        <button
                            type="button"
                            onClick={showPassword}
                            className="text-sm bg-transparent border-none text-black ml-2 hover:text-gray-600"
                        >
                            {showPwd ? <IoMdEyeOff size={22} /> : <IoMdEye size={22} />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            className="rounded"
                        />
                        <span>Remember me</span>
                    </label>

                    <Link href="/auth/forgot" className="text-blue-500 hover:underline">
                        Forgot password?
                    </Link>
                </div>

                {TurnstileKey && (
                    <div className="flex justify-center">
                        <Turnstile
                            sitekey={TurnstileKey}
                            theme="light"
                            size="flexible"
                            onVerify={() => setIsTurnstileVerified(true)}
                        />
                    </div>
                )}

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || (TurnstileKey && !isTurnstileVerified)}
                    className="w-full primary"
                >
                    {loading ? "Please wait..." : "Sign In"}
                </motion.button>

                <p className="text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link href="/auth/register" className="text-blue-500 font-medium hover:underline">
                        Sign Up
                    </Link>
                </p>

            </motion.form>

            <div className="mt-6 text-center">
                <Link href="/" className="text-blue-500 hover:underline">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
};

export default LoginPage;
