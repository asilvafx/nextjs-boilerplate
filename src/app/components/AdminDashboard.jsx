// components/AdminDashboard.jsx
"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useShopAPI } from '@/lib/shop.js';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [items, setItems] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    const { loading, getStats, getAllItems, bulkOperation } = useShopAPI();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsResponse, itemsResponse] = await Promise.all([
                getStats(),
                getAllItems({ limit: 100 }) // Get more items for bulk operations
            ]);

            if (statsResponse?.success) {
                setStats(statsResponse.data);
            }

            if (itemsResponse?.success) {
                setItems(itemsResponse.data);
            }
        } catch (error) {
            toast.error('Failed to load dashboard data');
        }
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(item => item.id));
        }
    };

    const handleBulkOperation = async (operation, data = null) => {
        if (selectedItems.length === 0) {
            toast.error('Please select items first');
            return;
        }

        const operationNames = {
            'delete': 'delete',
            'activate': 'activate',
            'deactivate': 'deactivate',
            'update': 'update'
        };

        const confirmMessage = `Are you sure you want to ${operationNames[operation]} ${selectedItems.length} selected item(s)?`;

        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await bulkOperation(operation, selectedItems, data);

            if (response?.success) {
                toast.success(response.message);
                setSelectedItems([]);
                loadDashboardData(); // Reload data
            } else {
                toast.error(response?.error || `Failed to ${operation} items`);
            }
        } catch (error) {
            toast.error(`Failed to ${operation} items`);
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Last updated: {stats?.generatedAt ? new Date(stats.generatedAt).toLocaleString() : 'Never'}
                </div>
            </div>

            {/* Statistics Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800">Total Items</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.overview.totalItems}</p>
                        <p className="text-sm text-blue-600">
                            {stats.overview.activeItems} active, {stats.overview.inactiveItems} inactive
                        </p>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800">Inventory Value</h3>
                        <p className="text-3xl font-bold text-green-600">${stats.overview.totalInventoryValue}</p>
                        <p className="text-sm text-green-600">
                            Avg: ${stats.overview.averagePrice}
                        </p>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-yellow-800">Stock Alerts</h3>
                        <p className="text-3xl font-bold text-yellow-600">{stats.inventory.lowStockCount}</p>
                        <p className="text-sm text-yellow-600">
                            {stats.inventory.outOfStockCount} out of stock
                        </p>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-800">Categories</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.overview.totalCategories}</p>
                        <p className="text-sm text-purple-600">
                            Total stock: {stats.inventory.totalStock}
                        </p>
                    </div>
                </div>
            )}

            {/* Low Stock Alerts */}
            {stats?.inventory.lowStockItems.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-yellow-800 mb-4">⚠️ Low Stock Alert</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.inventory.lowStockItems.slice(0, 6).map(item => (
                            <div key={item.id} className="bg-white p-3 rounded border">
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-gray-600">Stock: {item.stock || 0}</p>
                                <p className="text-sm text-gray-600">${item.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bulk Operations */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Bulk Operations</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            {showBulkActions ? 'Hide' : 'Show'} Bulk Actions
                        </button>
                        <button
                            onClick={handleSelectAll}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                </div>

                {selectedItems.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded">
                        <p className="text-blue-800">{selectedItems.length} item(s) selected</p>
                    </div>
                )}

                {showBulkActions && selectedItems.length > 0 && (
                    <div className="mb-6 p-4 border rounded bg-gray-50">
                        <h3 className="font-semibold mb-3">Bulk Actions</h3>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => handleBulkOperation('activate')}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            >
                                Activate Selected
                            </button>
                            <button
                                onClick={() => handleBulkOperation('deactivate')}
                                className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                            >
                                Deactivate Selected
                            </button>
                            <button
                                onClick={() => handleBulkOperation('delete')}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* Items List */}
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === items.length && items.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Category</th>
                            <th className="px-4 py-2 text-left">Price</th>
                            <th className="px-4 py-2 text-left">Stock</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map(item => (
                            <tr key={item.id} className={`border-b ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}>
                                <td className="px-4 py-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => handleSelectItem(item.id)}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-gray-600 truncate max-w-xs">
                                            {item.description}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                                            {item.category || 'No category'}
                                        </span>
                                </td>
                                <td className="px-4 py-2 font-semibold">${item.price}</td>
                                <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            (item.stock || 0) === 0
                                                ? 'bg-red-100 text-red-800'
                                                : (item.stock || 0) < 10
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                        }`}>
                                            {item.stock || 0}
                                        </span>
                                </td>
                                <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            item.isActive !== false
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {item.isActive !== false ? 'Active' : 'Inactive'}
                                        </span>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleBulkOperation(
                                                item.isActive !== false ? 'deactivate' : 'activate',
                                                [item.id]
                                            )}
                                            className={`px-2 py-1 rounded text-xs ${
                                                item.isActive !== false
                                                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                            }`}
                                        >
                                            {item.isActive !== false ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No items found.
                    </div>
                )}
            </div>

            {/* Category Statistics */}
            {stats?.categories && stats.categories.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.categories.map(category => (
                            <div key={category.name} className="border rounded p-4">
                                <h3 className="font-semibold capitalize">{category.name}</h3>
                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                    <div>Items: {category.count}</div>
                                    <div>Total Value: ${category.totalValue.toFixed(2)}</div>
                                    <div>Total Stock: {category.totalStock}</div>
                                    {category.averagePrice > 0 && (
                                        <div>Avg Price: ${category.averagePrice.toFixed(2)}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Expensive Items */}
            {stats?.topItems && stats.topItems.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Most Expensive Items</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.topItems.map((item, index) => (
                            <div key={item.id} className="border rounded p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-sm text-gray-600">{item.category}</p>
                                    </div>
                                    <span className="text-lg font-bold text-green-600">
                                        ${item.price}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                        #{index + 1}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
