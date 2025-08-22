"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { logout } from "../../../store/slices/authSlice.js";

const LogoutPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(true);

    useEffect(() => {
        const handleLogout = async () => {
            try {
                // Clear Redux state
                dispatch(logout());

                // Clear authentication cookie
                Cookies.remove("authUser", { path: '/' });

                // Clear any other auth-related cookies if you have them
                // Cookies.remove("refreshToken", { path: '/' });

                // Optional: Clear localStorage/sessionStorage if you store auth data there
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('authUser');
                    sessionStorage.removeItem('authUser');
                }

                // Show success message
                toast.success("Logged out successfully!");

                // Small delay to show the message
                setTimeout(() => {
                    setIsLoggingOut(false);
                    router.push("/auth/login");
                }, 1000);

            } catch (error) {
                console.error("Logout error:", error);
                toast.error("Error during logout");
                setIsLoggingOut(false);
                router.push("/auth/login");
            }
        };

        handleLogout();
    }, [dispatch, router]);

    if (isLoggingOut) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Logging out...</h2>
                    <p className="text-gray-600 dark:text-gray-400">Please wait while we sign you out.</p>
                </motion.div>
            </div>
        );
    }

    return null;
};

export default LogoutPage;
