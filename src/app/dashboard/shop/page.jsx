// app/dashboard/shop/page.jsx
"use client"
import { useState, useEffect } from 'react';
import { useShopAPI } from '@/lib/shop.js';
import ProductsSection from '../components/sections/ProductsSection';
import CategoriesManagement from '../components/sections/CategoriesManagement';
import CollectionsManagement from '../components/sections/CollectionsManagement';
import toast, { Toaster } from 'react-hot-toast';
import {
    Package,
    Tags,
    Star,
    ShoppingBag,
    TrendingUp,
    DollarSign,
    Eye,
    Plus,
    BarChart3
} from 'lucide-react';

const DashboardStore = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [quickStats, setQuickStats] = useState({
        totalProducts: 0,
        totalServices: 0,
        activeItems: 0,
        totalRevenue: 0,
        categories: 0,
        collections: 0
    });

    const {
        loading,
        error,
        getAllItems,
        getCategories,
        getCollections
    } = useShopAPI();

    // Load quick stats
    useEffect(() => {
        loadQuickStats();
    }, []);

    const loadQuickStats = async () => {
        try {
            const [itemsResponse, categoriesResponse, collectionsResponse] = await Promise.all([
                getAllItems({ limit: 1000 }), // Get all items for stats
                getCategories(),
                getCollections()
            ]);

            if (itemsResponse?.success && categoriesResponse?.success && collectionsResponse?.success) {
                const items = itemsResponse.data;
                const stats = {
                    totalProducts: items.filter(item => item.item_type === 'product').length,
                    totalServices: items.filter(item => item.item_type === 'service').length,
                    activeItems: items.filter(item => item.isActive).length,
                    totalRevenue: items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
                    categories: categoriesResponse.data.length,
                    collections: collectionsResponse.data.length
                };
                setQuickStats(stats);
            }
        } catch (err) {
            console.error('Error loading quick stats:', err);
        }
    };

    const statsCards = [
        {
            title: 'Total Products',
            value: quickStats.totalProducts,
            icon: Package,
            color: 'bg-blue-500',
            change: '+12%',
            changeType: 'positive'
        },
        {
            title: 'Total Services',
            value: quickStats.totalServices,
            icon: ShoppingBag,
            color: 'bg-green-500',
            change: '+8%',
            changeType: 'positive'
        },
        {
            title: 'Active Items',
            value: quickStats.activeItems,
            icon: TrendingUp,
            color: 'bg-purple-500',
            change: `${quickStats.totalProducts + quickStats.totalServices} total`,
            changeType: 'neutral'
        },
        {
            title: 'Est. Value',
            value: `$${quickStats.totalRevenue.toFixed(2)}`,
            icon: DollarSign,
            color: 'bg-yellow-500',
            change: '+15%',
            changeType: 'positive'
        },
        {
            title: 'Categories',
            value: quickStats.categories,
            icon: Tags,
            color: 'bg-cyan-500',
            change: 'Organize',
            changeType: 'neutral'
        },
        {
            title: 'Collections',
            value: quickStats.collections,
            icon: Star,
            color: 'bg-pink-500',
            change: 'Featured',
            changeType: 'neutral'
        }
    ];

    const tabNavigation = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'categories', label: 'Categories', icon: Tags },
        { id: 'collections', label: 'Collections', icon: Star }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewContent statsCards={statsCards} />;
            case 'products':
                return <ProductsContent />;
            case 'categories':
                return <CategoriesContent />;
            case 'collections':
                return <CollectionsContent />;
            default:
                return <OverviewContent statsCards={statsCards} />;
        }
    };

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1f2937',
                        color: '#f9fafb',
                        border: '1px solid #374151',
                        borderRadius: '12px'
                    }
                }}
            />

            <div className="fade-in">
                <div className="dashboard-card-header">
                    <div>
                        <h1 className="dashboard-card-title">Shop Management</h1>
                        <p className="dashboard-card-subtitle">Manage your products, services, and catalog</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="my-4">
                    <nav className="flex flex-wrap gap-2 space-x-1 p-1 rounded-lg">
                        {tabNavigation.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        activeTab === tab.id
                                            ? 'bg-neutral-100 text-black shadow-sm'
                                            : 'text-gray-600 hover:text-white'
                                    }`}
                                >
                                    <Icon color={activeTab === tab.id ? "black" : "white"} size={18} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </div>
        </>
    );
};

// Overview Content Component
const OverviewContent = ({ statsCards }) => (
    <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsCards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div key={index} className="dashboard-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-100">{card.value || '-'}</p>
                                <div className="flex items-center mt-2">
                                    <span className={`text-sm ${
                                        card.changeType === 'positive'
                                            ? 'text-green-600'
                                            : card.changeType === 'negative'
                                                ? 'text-red-600'
                                                : 'text-gray-500'
                                    }`}>
                                        {card.change}
                                    </span>
                                </div>
                            </div>
                            <div className={`${card.color} p-3 rounded-lg`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    onClick={() => window.location.hash = '#products'}
                    className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">Add Product</span>
                </button>
                <button
                    onClick={() => window.location.hash = '#products'}
                    className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                    <Plus className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">Add Service</span>
                </button>
                <button
                    onClick={() => window.location.hash = '#categories'}
                    className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                    <Tags className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-700">Manage Categories</span>
                </button>
                <button
                    onClick={() => window.location.hash = '#collections'}
                    className="flex items-center space-x-3 p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                >
                    <Star className="w-5 h-5 text-pink-600" />
                    <span className="font-medium text-pink-700">Create Collection</span>
                </button>
            </div>
        </div>
    </div>
);

// Products Content Component
const ProductsContent = () => (
    <ProductsSection />
);

// Categories Content Component
const CategoriesContent = () => (
    <CategoriesManagement />
);

// Collections Content Component
const CollectionsContent = () => (
    <CollectionsManagement />
);

export default DashboardStore;
