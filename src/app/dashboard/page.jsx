"use client"

// app/dashboard/page.jsx
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import '@/app/styles/Dashboard.css';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import MobileHeader from './components/layout/MobileHeader';

// Section Components
import OverviewSection from './components/sections/OverviewSection';
import UsersSection from './components/sections/UsersSection';
import ProductsSection from './components/sections/ProductsSection';
import ServicesSection, {
    OrdersSection,
    CustomersSection,
    GallerySection,
    PagesSection,
    AnalyticsSection,
    SettingsSection
} from './components/sections/RemainingSection';

// Common Components
import { LoadingSpinner } from './components/common/Common';

// Custom Hooks
import { useDashboardData, useStatsCalculation } from './hooks/useDashboardData';

const DashboardPage = () => {
    const t = useTranslations('HomePage');
    const [activeSection, setActiveSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Fetch dashboard data
    const { data: currentData, loading, error } = useDashboardData();
    const { statsCards } = useStatsCalculation(currentData);

    // Section component mapping
    const sectionComponents = {
        overview: () => <OverviewSection statsCards={statsCards} currentData={currentData} />,
        analytics: () => <AnalyticsSection />,
        access: () => <UsersSection users={currentData.recentUsers} />,
        shop: () => <ProductsSection products={currentData.products} />,
        orders: () => <OrdersSection orders={currentData.recentOrders} />,
        customers: () => <CustomersSection />,
        gallery: () => <GallerySection />,
        pages: () => <PagesSection />,
        settings: () => <SettingsSection />
    };

    // Render content based on active section
    const renderContent = () => {
        const Component = sectionComponents[activeSection];
        return Component ? Component() : sectionComponents.overview();
    };

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-main">
                    <div className="dashboard-content">
                        <div className="dashboard-card">
                            <div className="empty-state">
                                <div className="empty-state-icon">⚠️</div>
                                <h3 className="empty-state-title">Error Loading Dashboard</h3>
                                <p className="empty-state-description">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Mobile Header */}
            <MobileHeader
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Sidebar */}
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Main Content */}
            <div className="dashboard-main">
                <div className="dashboard-content">
                    {loading && <LoadingSpinner />}
                    {!loading && renderContent()}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
