// app/layoutWrapper.jsx
'use client';

import { usePathname } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './dashboard/components/layout/Sidebar';
import MobileHeader from './dashboard/components/layout/MobileHeader';
import { DashboardProvider } from './dashboard/context/DashboardContext';

// Define layout rules
const layoutRules = [
    {
        pattern: /^\/dashboard(?:\/.*)?$/,
        layout: 'dashboard',
        description: 'Dashboard layout for all dashboard routes'
    },
    {
        pattern: /^\/auth|^\/login|^\/register/,
        layout: 'auth',
        description: 'Auth layout for authentication pages'
    },
    {
        pattern: /^\/admin(?:\/.*)?$/,
        layout: 'admin',
        description: 'Admin layout for admin routes'
    }
];

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const matchedRule = layoutRules.find(rule => rule.pattern.test(pathname));
    const layoutType = matchedRule?.layout || 'main';

    switch (layoutType) {
        case 'dashboard':
            return (
                <DashboardProvider>
                    <div className="dashboard-layout">
                        <div className="dashboard-container">
                            <main className="dashboard-main">
                                <MobileHeader />
                                <Sidebar />
                                <div className="dashboard-content">
                                    {children}
                                </div>
                            </main>
                        </div>
                    </div>
                </DashboardProvider>
            );

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
