// app/layoutWrapper.jsx
'use client';

import { usePathname } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';

// Define layout rules
const layoutRules = [
    {
        pattern: /^\/dashboard/,
        layout: 'dashboard'
    },
    {
        pattern: /^\/auth|^\/login|^\/register/,
        layout: 'auth'
    },
    // Add more patterns as needed
];

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();

    // Find matching layout rule
    const matchedRule = layoutRules.find(rule => rule.pattern.test(pathname));
    const layoutType = matchedRule?.layout || 'main';

    switch (layoutType) {
        case 'dashboard':
            return children;

        case 'auth':
            return (
                <div className="container">
                    <div className="screen">
                        <Header />
                        {children}
                        <Footer />
                    </div>
                </div>
            );

        case 'main':
        default:
            return (
                <div className="container">
                    <div className="screen">
                        <Header />
                        {children}
                        <Footer />
                    </div>
                </div>
            );
    }
}
