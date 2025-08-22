import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth.js';

const CTABanner = () => {
    const { user, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return (
            <div className="cta-banner authenticated">
                <div className="cta-content">
                    <div className="cta-text">
                        <h3>Welcome back, {user?.displayName || 'friend'}! ✨</h3>
                        <p>Ready to explore your spiritual journey further?</p>
                    </div>
                    <div className="cta-actions">
                        <Link href="/dashboard" className="button primary">
                            Go to Dashboard
                        </Link>
                        <Link href="/auth/logout" className="button">
                            Logout
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cta-banner">
            <div className="cta-content">
                <div className="cta-text">
                    <h3>Ready to unlock your spiritual insights? 🌟</h3>
                    <p>Join our community and get access to exclusive readings, personalized guidance, and spiritual tools.</p>
                    <div className="cta-benefits">
                        <span className="benefit">✓ Track your reading history</span>
                        <span className="benefit">✓ Save favorite insights</span>
                        <span className="benefit">✓ Get personalized recommendations</span>
                    </div>
                </div>
                <div className="cta-actions">
                    <Link href="/auth/register" className="button primary">
                        Create Free Account
                    </Link>
                    <Link href="/auth/login" className="button">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CTABanner;
