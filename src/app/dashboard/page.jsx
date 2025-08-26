"use client"

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import '@/app/styles/Dashboard.css';

// Mock data - replace with actual API calls
const mockData = {
    stats: {
        totalUsers: 1248,
        totalOrders: 892,
        totalRevenue: 15420,
        totalProducts: 156
    },
    recentOrders: [
        { id: '001', customer: 'John Doe', product: 'Cool Tag', amount: '$9.99', status: 'active', date: '2025-01-15' },
        { id: '002', customer: 'Jane Smith', product: 'Collar + Tag', amount: '$14.99', status: 'pending', date: '2025-01-14' },
        { id: '003', customer: 'Mike Johnson', product: 'Crystal Set', amount: '$45.00', status: 'active', date: '2025-01-13' }
    ],
    recentUsers: [
        { id: '001', name: 'Alice Wilson', email: 'alice@example.com', role: 'Customer', status: 'active', joined: '2025-01-10' },
        { id: '002', name: 'Bob Brown', email: 'bob@example.com', role: 'Customer', status: 'inactive', joined: '2025-01-09' }
    ],
    products: [
        { id: '001', name: 'Cool Tag', category: 'Product', price: '$9.99', stock: 150, status: 'active' },
        { id: '002', name: 'Collar + Tag', category: 'Product', price: '$14.99', stock: 75, status: 'active' },
        { id: '003', name: 'Tarot Reading', category: 'Service', price: '$15.00', stock: 'N/A', status: 'active' }
    ]
};

// Product Modal Component
const ProductModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'product',
        inStock: true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'product',
            inStock: true
        });
    };

    if (!isOpen) return null;

    return (
        <div className="dashboard-modal-overlay">
            <div className="dashboard-modal">
                <div className="modal-header">
                    <h2 className="modal-title">Add New Product</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="dashboard-form">
                        <div className="form-group">
                            <label className="form-label">Product Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Enter product name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Enter product description"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label className="form-label">Price</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="product">Product</option>
                                    <option value="service">Service</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="inStock"
                                    className="form-checkbox"
                                    checked={formData.inStock}
                                    onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                                />
                                <label htmlFor="inStock" className="form-label">In Stock</label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="button" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="button primary">
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Overview Section Component
const OverviewSection = ({ statsCards, currentData }) => (
    <div className="fade-in">
        <div className="dashboard-card-header">
            <div>
                <h1 className="dashboard-card-title">Dashboard Overview</h1>
                <p className="dashboard-card-subtitle">Welcome back! Here's what's happening.</p>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
            {statsCards.map((stat, index) => (
                <div key={index} className="stat-card">
                    <div className="stat-content">
                        <div className="stat-header">
                            <div className="stat-title">{stat.title}</div>
                            <div className="stat-icon">{stat.icon}</div>
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div className={`stat-change ${stat.trend.direction}`}>
                            <span>
                                {stat.trend.direction === 'positive' ? '↗' :
                                    stat.trend.direction === 'negative' ? '↘' : '→'}
                            </span>
                            <span>{stat.trend.value}%</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
            <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
                <div className="quick-action">
                    <div className="quick-action-icon">+</div>
                    <div className="quick-action-title">Add Product</div>
                    <div className="quick-action-description">Create a new product listing</div>
                </div>
                <div className="quick-action">
                    <div className="quick-action-icon">👤</div>
                    <div className="quick-action-title">Add User</div>
                    <div className="quick-action-description">Create new user account</div>
                </div>
                <div className="quick-action">
                    <div className="quick-action-icon">📊</div>
                    <div className="quick-action-title">View Reports</div>
                    <div className="quick-action-description">Generate analytics reports</div>
                </div>
            </div>
        </div>

        {/* Recent Activity */}
        <div className="analytics-grid">
            <div className="dashboard-card">
                <div className="dashboard-card-header">
                    <h3 className="dashboard-card-title">Recent Orders</h3>
                    <span className="dashboard-card-action">View All</span>
                </div>
                <div className="dashboard-table-container">
                    <table className="dashboard-table">
                        <thead className="table-header">
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody className="table-body">
                        {currentData.recentOrders.map((order) => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{order.customer}</td>
                                <td>{order.product}</td>
                                <td>{order.amount}</td>
                                <td>
                                        <span className={`status-badge ${order.status}`}>
                                            {order.status}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="dashboard-card">
                <div className="dashboard-card-header">
                    <h3 className="dashboard-card-title">Recent Users</h3>
                    <span className="dashboard-card-action">View All</span>
                </div>
                <div className="dashboard-table-container">
                    <table className="dashboard-table">
                        <thead className="table-header">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody className="table-body">
                        {currentData.recentUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                        <span className={`status-badge ${user.status}`}>
                                            {user.status}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
);

// Users Management Section
const UsersSection = ({ users }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    return (
        <div className="fade-in">
            <div className="dashboard-card-header">
                <div>
                    <h1 className="dashboard-card-title">Users Management</h1>
                    <p className="dashboard-card-subtitle">Manage user accounts and permissions</p>
                </div>
                <button className="button primary">Add New User</button>
            </div>

            {/* Search and Filters */}
            <div className="search-filters">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                    <option value="moderator">Moderator</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="dashboard-card">
                <div className="dashboard-table-container">
                    <table className="dashboard-table">
                        <thead className="table-header">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody className="table-body">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                        <span className={`status-badge ${user.status}`}>
                                            {user.status}
                                        </span>
                                </td>
                                <td>{user.joined}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="action-button primary" title="Edit">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button className="action-button" title="View">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button className="action-button danger" title="Delete">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Products Management Section
const ProductsSection = ({ products }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [productList, setProductList] = useState(products);

    const handleAddProduct = (productData) => {
        const newProduct = {
            id: String(productList.length + 1).padStart(3, '0'),
            ...productData,
            stock: productData.category === 'service' ? 'N/A' : Math.floor(Math.random() * 200),
            price: `$${productData.price}`
        };
        setProductList([...productList, newProduct]);
        setShowAddModal(false);
    };

    return (
        <div className="fade-in">
            <div className="dashboard-card-header">
                <div>
                    <h1 className="dashboard-card-title">Products Management</h1>
                    <p className="dashboard-card-subtitle">Manage your product catalog</p>
                </div>
                <button
                    className="button primary"
                    onClick={() => setShowAddModal(true)}
                >
                    Add Product
                </button>
            </div>

            <div className="dashboard-card">
                {productList.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3 className="empty-state-title">No Products Found</h3>
                        <p className="empty-state-description">
                            Start by adding your first product to the catalog.
                        </p>
                        <button
                            className="button primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Your First Product
                        </button>
                    </div>
                ) : (
                    <div className="dashboard-table-container">
                        <table className="dashboard-table">
                            <thead className="table-header">
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody className="table-body">
                            {productList.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>{product.price}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                            <span className={`status-badge ${product.status}`}>
                                                {product.status}
                                            </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-button primary" title="Edit">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button className="action-button" title="View">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button className="action-button danger" title="Delete">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ProductModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddProduct}
            />
        </div>
    );
};

// Services Management Section
const ServicesSection = () => (
    <div className="fade-in">
        <div className="dashboard-card-header">
            <div>
                <h1 className="dashboard-card-title">Services Management</h1>
                <p className="dashboard-card-subtitle">Manage your service offerings</p>
            </div>
            <button className="button primary">Add Service</button>
        </div>

        <div className="dashboard-card">
            <div className="empty-state">
                <div className="empty-state-icon">⚙️</div>
                <h3 className="empty-state-title">No Services Found</h3>
                <p className="empty-state-description">
                    Add services like consultations, readings, or other offerings.
                </p>
                <button className="button primary">Add Your First Service</button>
            </div>
        </div>
    </div>
);

// Orders Management Section
const OrdersSection = ({ orders }) => (
    <div className="fade-in">
        <div className="dashboard-card-header">
            <div>
                <h1 className="dashboard-card-title">Orders Management</h1>
                <p className="dashboard-card-subtitle">Track and manage customer orders</p>
            </div>
        </div>

        <div className="dashboard-card">
            <div className="dashboard-table-container">
                <table className="dashboard-table">
                    <thead className="table-header">
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody className="table-body">
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.customer}</td>
                            <td>{order.product}</td>
                            <td>{order.amount}</td>
                            <td>{order.date}</td>
                            <td>
                                    <span className={`status-badge ${order.status}`}>
                                        {order.status}
                                    </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-button primary" title="View Details">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <button className="action-button" title="Update Status">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

// Customers Section
const CustomersSection = () => (
    <div className="fade-in">
        <div className="dashboard-card-header">
            <div>
                <h1 className="dashboard-card-title">Customers</h1>
                <p className="dashboard-card-subtitle">Manage customer relationships</p>
            </div>
        </div>

        <div className="dashboard-card">
            <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <h3 className="empty-state-title">Customer Management</h3>
                <p className="empty-state-description">
                    View customer profiles, order history, and communication logs.
                </p>
            </div>
        </div>
    </div>
);

// Gallery Section
const GallerySection = () => (
    <div className="fade-in">
        <div className="dashboard-card-header">
            <div>
                <h1 className="dashboard-card-title">Gallery Management</h1>
                <p className="dashboard-card-subtitle">Manage images and media files</p>
            </div>
            <button className="button primary">Upload Images</button>
        </div>

        <div className="dashboard-card">
            <div className="file-upload">
                <div className="file-upload-icon">📁</div>
                <div className="file-upload-text">Drag and drop images here</div>
                <div className="file-upload-subtext">or click to browse files</div>
            </div>
        </div>
    </div>
);

// Pages Section
const PagesSection = () => (
    <div className="fade-in">
        <div className="dashboard-card-header">
            <div>
                <h1 className="dashboard-card-title">Pages Management</h1>
                <p className="dashboard-card-subtitle">Manage website content and pages</p>
            </div>
            <button className="button primary">Create Page</button>
        </div>

        <div className="dashboard-card">
            <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <h3 className="empty-state-title">Content Management</h3>
                <p className="empty-state-description">
                    Create and manage website pages, blog posts, and content.
                </p>
                <button className="button primary">Create Your First Page</button>
            </div>
        </div>
    </div>
);

// Analytics Section
const AnalyticsSection = () => (
    <div className="fade-in">
        <div className="dashboard-card-header">
            <div>
                <h1 className="dashboard-card-title">Analytics Dashboard</h1>
                <p className="dashboard-card-subtitle">Track performance and insights</p>
            </div>
        </div>

        <div className="analytics-grid">
            <div className="dashboard-card">
                <h3 className="dashboard-card-title">Traffic Overview</h3>
                <div className="chart-container">
                    <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <p className="empty-state-description">Chart will be displayed here</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-card">
                <h3 className="dashboard-card-title">Revenue Trends</h3>
                <div className="chart-container">
                    <div className="empty-state">
                        <div className="empty-state-icon">💹</div>
                        <p className="empty-state-description">Revenue chart will be displayed here</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Settings Section
const SettingsSection = () => (
    <div className="fade-in">
        <div className="dashboard-card-header">
            <div>
                <h1 className="dashboard-card-title">Settings</h1>
                <p className="dashboard-card-subtitle">Configure your application settings</p>
            </div>
        </div>

        <div className="dashboard-card">
            <div className="dashboard-form">
                <div className="form-group">
                    <label className="form-label">Site Name</label>
                    <input type="text" className="form-input" placeholder="Enter site name" />
                </div>

                <div className="form-group">
                    <label className="form-label">Site Description</label>
                    <textarea className="form-textarea" placeholder="Enter site description"></textarea>
                </div>

                <div className="form-group">
                    <label className="form-label">Email Notifications</label>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="email-notifications" className="form-checkbox" />
                        <label htmlFor="email-notifications" className="text-sm text-slate-300">
                            Enable email notifications
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <button className="button primary">Save Settings</button>
                </div>
            </div>
        </div>
    </div>
);

// Main Dashboard Component
const DashboardPage = () => {
    const t = useTranslations('HomePage');
    const [activeSection, setActiveSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentData, setCurrentData] = useState(mockData);
    const [loading, setLoading] = useState(false);

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

    // Stats calculation with trend
    const calculateTrend = (current, previous) => {
        if (!previous) return { value: 0, direction: 'neutral' };
        const change = ((current - previous) / previous) * 100;
        return {
            value: Math.abs(change).toFixed(1),
            direction: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
        };
    };

    const statsCards = [
        {
            title: 'Total Users',
            value: currentData.stats.totalUsers.toLocaleString(),
            icon: '👥',
            trend: calculateTrend(currentData.stats.totalUsers, 1150)
        },
        {
            title: 'Total Orders',
            value: currentData.stats.totalOrders.toLocaleString(),
            icon: '🛒',
            trend: calculateTrend(currentData.stats.totalOrders, 820)
        },
        {
            title: 'Revenue',
            value: `${currentData.stats.totalRevenue.toLocaleString()}`,
            icon: '💰',
            trend: calculateTrend(currentData.stats.totalRevenue, 14200)
        },
        {
            title: 'Products',
            value: currentData.stats.totalProducts.toLocaleString(),
            icon: '📦',
            trend: calculateTrend(currentData.stats.totalProducts, 142)
        }
    ];

    // Render different sections based on activeSection
    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return <OverviewSection statsCards={statsCards} currentData={currentData} />;
            case 'analytics':
                return <AnalyticsSection />;
            case 'users':
                return <UsersSection users={currentData.recentUsers} />;
            case 'products':
                return <ProductsSection products={currentData.products} />;
            case 'services':
                return <ServicesSection />;
            case 'orders':
                return <OrdersSection orders={currentData.recentOrders} />;
            case 'customers':
                return <CustomersSection />;
            case 'gallery':
                return <GallerySection />;
            case 'pages':
                return <PagesSection />;
            case 'settings':
                return <SettingsSection />;
            default:
                return <OverviewSection statsCards={statsCards} currentData={currentData} />;
        }
    };

    return (
        <div className="dashboard-container">
            {/* Mobile Header */}
            <div className="dashboard-mobile-header">
                <div className="mobile-header-content">
                    <div className="sidebar-brand">
                        <div className="sidebar-logo">A</div>
                        <div className="sidebar-title">Admin Panel</div>
                    </div>
                    <button
                        className="mobile-menu-button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

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

            {/* Main Content */}
            <div className="dashboard-main">
                <div className="dashboard-content">
                    {loading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
                        </div>
                    )}
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
