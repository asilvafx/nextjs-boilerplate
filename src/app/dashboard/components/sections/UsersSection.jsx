// app/dashboard/components/sections/UsersSection.jsx
"use client"
import { useState } from 'react';
import { DataTable, StatusBadge, ActionButtons } from '../common/Common';

const UsersSection = ({ users }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    const handleEditUser = (userId) => {
        console.log('Edit user:', userId);
    };

    const handleViewUser = (userId) => {
        console.log('View user:', userId);
    };

    const handleDeleteUser = (userId) => {
        console.log('Delete user:', userId);
    };

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
                <DataTable headers={['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions']}>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <StatusBadge status={user.status} />
                            </td>
                            <td>{user.joined}</td>
                            <td>
                                <ActionButtons
                                    onEdit={() => handleEditUser(user.id)}
                                    onView={() => handleViewUser(user.id)}
                                    onDelete={() => handleDeleteUser(user.id)}
                                />
                            </td>
                        </tr>
                    ))}
                </DataTable>
            </div>
        </div>
    );
};

export default UsersSection;
