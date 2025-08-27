// app/dashboard/components/layout/Sidebar.jsx
"use client"

const Sidebar = ({
                     activeSection,
                     setActiveSection,
                     sidebarOpen,
                     setSidebarOpen
                 }) => {
    // Navigation items
    const navigationSections = [
        {
            title: 'Main',
            items: [
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'analytics', label: 'Analytics', icon: '📈' }
            ]
        },
        {
            title: 'Management',
            items: [
                { id: 'users', label: 'Users', icon: '👥', badge: '12' },
                { id: 'products', label: 'Products', icon: '📦' },
                { id: 'services', label: 'Services', icon: '⚙️' },
                { id: 'orders', label: 'Orders', icon: '🛒', badge: '3' },
                { id: 'customers', label: 'Customers', icon: '👤' }
            ]
        },
        {
            title: 'Content',
            items: [
                { id: 'gallery', label: 'Gallery', icon: '🖼️' },
                { id: 'pages', label: 'Pages', icon: '📄' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
            ]
        }
    ];

    return (
        <>
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`dashboard-sidebar ${!sidebarOpen ? 'mobile-hidden' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="sidebar-logo">A</div>
                        <div className="sidebar-title">Admin Panel</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navigationSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="sidebar-section">
                            <div className="sidebar-section-title">{section.title}</div>
                            {section.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveSection(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
                                >
                                    <span className="sidebar-icon">{item.icon}</span>
                                    <span className="sidebar-text">{item.label}</span>
                                    {item.badge && (
                                        <span className="sidebar-badge">{item.badge}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
