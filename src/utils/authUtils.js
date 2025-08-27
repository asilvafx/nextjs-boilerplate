// utils/authUtils.js

// Utility function for making authenticated API calls
export const authenticatedFetch = async (url, options = {}) => {
    const defaultOptions = {
        credentials: 'include', // Include cookies (JWT token)
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, defaultOptions);

        // If token is invalid/expired, redirect to login
        if (response.status === 403) {
            window.location.href = '/auth/login';
            return null;
        }

        return response;
    } catch (error) {
        console.error('Authenticated fetch error:', error);
        throw error;
    }
};

// Utility function to logout user
export const logoutUser = async () => {
    try {
        const response = await authenticatedFetch('/api/auth/logout', {
            method: 'POST'
        });

        if (response && response.ok) {
            // Clear any client-side state if needed
            // Redirect to login page
            window.location.href = '/auth/login';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even if API call fails
        window.location.href = '/auth/login';
    }
};

// Hook for checking authentication status on client-side
export const useAuthCheck = () => {
    const checkAuth = async () => {
        try {
            const response = await authenticatedFetch('/api/auth/verify');
            return response && response.ok;
        } catch (error) {
            return false;
        }
    };

    return { checkAuth };
};
