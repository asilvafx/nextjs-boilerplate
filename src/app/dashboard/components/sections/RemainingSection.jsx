// app/dashboard/components/sections/ServicesSection.jsx
"use client"
import { EmptyState } from '../common/Common';

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
            <EmptyState
                icon="⚙️"
                title="No Services Found"
                description="Add services like consultations, readings, or other offerings."
                actionButton={<button className="button primary">Add Your First Service</button>}
            />
        </div>
    </div>
);

// app/dashboard/components/sections/OrdersSection.jsx
import React from 'react';
import { DataTable, StatusBadge, ActionButtons } from '../common/Common';

export const OrdersSection = ({ orders }) => {
    const handleViewOrder = (orderId) => {
        console.log('View order:', orderId);
    };

    const handleUpdateStatus = (orderId) => {
        console.log('Update order status:', orderId);
    };

    return (
        <div className="fade-in">
            <div className="dashboard-card-header">
                <div>
                    <h1 className="dashboard-card-title">Orders Management</h1>
                    <p className="dashboard-card-subtitle">Track and manage customer orders</p>
                </div>
            </div>

            <div className="dashboard-card">
                <DataTable headers={['Order ID', 'Customer', 'Product', 'Amount', 'Date', 'Status', 'Actions']}>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.customer}</td>
                            <td>{order.product}</td>
                            <td>{order.amount}</td>
                            <td>{order.date}</td>
                            <td>
                                <StatusBadge status={order.status} />
                            </td>
                            <td>
                                <ActionButtons
                                    onView={() => handleViewOrder(order.id)}
                                    onEdit={() => handleUpdateStatus(order.id)}
                                    viewTitle="View Details"
                                    editTitle="Update Status"
                                    onDelete={null}
                                />
                            </td>
                        </tr>
                    ))}
                </DataTable>
            </div>
        </div>
    );
};

// app/dashboard/components/sections/CustomersSection.jsx 

export const CustomersSection = () => (
    <div className="fade-in">
        <div className="dashboard-card-header">
            <div>
                <h1 className="dashboard-card-title">Customers</h1>
                <p className="dashboard-card-subtitle">Manage customer relationships</p>
            </div>
        </div>

        <div className="dashboard-card">
            <EmptyState
                icon="👤"
                title="Customer Management"
                description="View customer profiles, order history, and communication logs."
            />
        </div>
    </div>
);

// app/dashboard/components/sections/GallerySection.jsx
export const GallerySection = () => (
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

// app/dashboard/components/sections/PagesSection.jsx
export const PagesSection = () => (
    <div className="fade-in">
        <div className="dashboard-card-header">
            <div>
                <h1 className="dashboard-card-title">Pages Management</h1>
                <p className="dashboard-card-subtitle">Manage website content and pages</p>
            </div>
            <button className="button primary">Create Page</button>
        </div>

        <div className="dashboard-card">
            <EmptyState
                icon="📄"
                title="Content Management"
                description="Create and manage website pages, blog posts, and content."
                actionButton={<button className="button primary">Create Your First Page</button>}
            />
        </div>
    </div>
);

// app/dashboard/components/sections/AnalyticsSection.jsx
export const AnalyticsSection = () => (
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
                    <EmptyState
                        icon="📊"
                        description="Chart will be displayed here"
                    />
                </div>
            </div>

            <div className="dashboard-card">
                <h3 className="dashboard-card-title">Revenue Trends</h3>
                <div className="chart-container">
                    <EmptyState
                        icon="💹"
                        description="Revenue chart will be displayed here"
                    />
                </div>
            </div>
        </div>
    </div>
);

// app/dashboard/components/sections/SettingsSection.jsx
export const SettingsSection = () => (
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

export default ServicesSection;
