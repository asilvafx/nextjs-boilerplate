// app/dashboard/components/sections/CatalogManagement.jsx
"use client"
import { useState, useEffect, useRef, useCallback } from 'react';
import { useShopAPI } from '@/lib/shop.js';
import ProductModal from '../modals/ProductModal';
import { DataTable, StatusBadge, ActionButtons, EmptyState } from '../common/Common';
import toast, { Toaster } from 'react-hot-toast';
import { Box } from 'lucide-react';

const CatalogManagement = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productList, setProductList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Separate loading states
    const [loadingItems, setLoadingItems] = useState(false); // Changed from true to false
    const [loadingCategories, setLoadingCategories] = useState(false); // Changed from true to false
    const [isSearching, setIsSearching] = useState(false);

    // Refs to prevent double API calls
    const itemsLoadedRef = useRef(false);
    const categoriesLoadedRef = useRef(false);
    const searchTimeoutRef = useRef(null);

    const {
        loading,
        error,
        getAllItems,
        getCategories,
        createItem,
        updateItem,
        deleteItem
    } = useShopAPI();

    // Memoized loadItems function to prevent double calls
    const loadItems = useCallback(async (isInitialLoad = false) => {
        // Prevent double calls on initial load
        if (isInitialLoad && itemsLoadedRef.current) return;
        if (isInitialLoad) itemsLoadedRef.current = true;

        try {
            // Only set loading to true if we don't have data yet or it's not initial load
            if (productList.length === 0 || !isInitialLoad) {
                setLoadingItems(true);
            }

            const params = {
                page: currentPage,
                limit: 10,
                ...(searchTerm && { search: searchTerm }),
                ...(filterCategory && { category: filterCategory })
            };

            const response = await getAllItems(params);

            if (response && response.success) {
                setProductList(response.data);
                setTotalPages(response.pagination.totalPages);
                // Ensure loading is set to false when data is successfully loaded
                setLoadingItems(false);
            } else {
                setLoadingItems(false);
            }
        } catch (err) {
            console.error('Error loading items:', err);
            toast.error('Failed to load items');
            // Reset ref on error so user can retry
            if (isInitialLoad) itemsLoadedRef.current = false;
            setLoadingItems(false);
        }
    }, [currentPage, searchTerm, filterCategory, getAllItems, productList.length]);

    // Memoized loadCategories function to prevent double calls
    const loadCategories = useCallback(async () => {
        // Prevent double calls
        if (categoriesLoadedRef.current) return;
        categoriesLoadedRef.current = true;

        try {
            // Only set loading if we don't have categories yet
            if (categories.length === 0) {
                setLoadingCategories(true);
            }

            const response = await getCategories();
            if (response && response.success) {
                setCategories(response.data);
                // Ensure loading is set to false when data is successfully loaded
                setLoadingCategories(false);
            } else {
                setLoadingCategories(false);
            }
        } catch (err) {
            console.error('Error loading categories:', err);
            toast.error('Failed to load categories');
            // Reset ref on error so user can retry
            categoriesLoadedRef.current = false;
            setLoadingCategories(false);
        }
    }, [getCategories, categories.length]);

    // Initial load effect - only runs once
    useEffect(() => {
        loadItems(true); // Initial load
        loadCategories();

        // Cleanup function
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []); // Empty dependency array - only run once

    // Effect for pagination and filtering changes (not initial load)
    useEffect(() => {
        if (itemsLoadedRef.current) {
            loadItems(false); // Not initial load
        }
    }, [currentPage, searchTerm, filterCategory, loadItems]);

    // Retry functions
    const retryLoadItems = useCallback(() => {
        itemsLoadedRef.current = false;
        loadItems(true);
    }, [loadItems]);

    const retryLoadCategories = useCallback(() => {
        categoriesLoadedRef.current = false;
        loadCategories();
    }, [loadCategories]);

    // Skeleton Components
    const ItemsSkeletonLoader = () => (
        <div className="space-y-4">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            </div>
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse border-b border-gray-200 pb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                        </div>
                        <div className="w-16 h-6 bg-gray-300 rounded"></div>
                        <div className="w-12 h-6 bg-gray-300 rounded"></div>
                        <div className="w-20 h-6 bg-gray-300 rounded"></div>
                        <div className="w-24 h-8 bg-gray-300 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    const SearchSkeletonLoader = () => (
        <div className="dashboard-card mb-4">
            <div className="animate-pulse">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                        <div className="h-10 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                        <div className="h-10 bg-gray-300 rounded"></div>
                    </div>
                    <div className="w-20 h-10 bg-gray-300 rounded"></div>
                    <div className="w-16 h-10 bg-gray-300 rounded"></div>
                </div>
            </div>
        </div>
    );

    const handleAddProduct = async (productData) => {
        try {
            const response = await createItem(productData);
            if (response && response.success) {
                setShowAddModal(false);
                await loadItems(); // Refresh the list
            }
        } catch (err) {
            console.error('Error creating product:', err);
            // Error toast is already handled in ProductModal via toast.promise
        }
    };

    const handleEditProduct = async (productId) => {
        const product = productList.find(p => p.id === productId);
        if (product) {
            setSelectedProduct(product);
            setShowEditModal(true);
        }
    };

    const handleUpdateProduct = async (productData) => {
        try {
            const response = await updateItem(selectedProduct.id, productData);
            if (response && response.success) {
                setShowEditModal(false);
                setSelectedProduct(null);
                await loadItems(); // Refresh the list
            }
        } catch (err) {
            console.error('Error updating product:', err);
            // Error toast is already handled in ProductModal via toast.promise
        }
    };

    const handleViewProduct = (productId) => {
        const product = productList.find(p => p.id === productId);
        if (product) {
            // Create a more detailed view toast
            toast.custom((t) => (
                <div className={`bg-gray-800 text-white p-4 rounded-xl shadow-lg border border-gray-700 max-w-md ${
                    t.visible ? 'animate-in' : 'animate-out'
                }`}>
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="text-gray-400 hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Price:</span> ${product.price}</p>
                        <p><span className="font-medium">Category:</span> {product.category}</p>
                        <p><span className="font-medium">Type:</span> {product.item_type}</p>
                        {product.description && (
                            <p><span className="font-medium">Description:</span> {product.description}</p>
                        )}
                    </div>
                </div>
            ), {
                duration: 5000,
                position: 'top-center'
            });
        }
    };

    const handleDeleteProduct = async (productId) => {
        const product = productList.find(p => p.id === productId);
        if (!product) return;

        // Custom confirmation toast
        toast.custom((t) => (
            <div className={`bg-gray-800 text-white p-4 rounded-xl shadow-lg border border-red-500 max-w-md ${
                t.visible ? 'animate-in' : 'animate-out'
            }`}>
                <div className="mb-3">
                    <h3 className="font-semibold text-lg text-red-400">Confirm Deletion</h3>
                    <p className="text-sm mt-1">
                        Are you sure you want to delete "{product.name}"? This action cannot be undone.
                    </p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);

                            const deletePromise = new Promise(async (resolve, reject) => {
                                try {
                                    const response = await deleteItem(productId);
                                    if (response && response.success) {
                                        await loadItems();
                                        resolve();
                                    } else {
                                        reject(new Error('Failed to delete item'));
                                    }
                                } catch (error) {
                                    reject(error);
                                }
                            });

                            toast.promise(deletePromise, {
                                loading: 'Deleting item...',
                                success: 'Item deleted successfully!',
                                error: 'Failed to delete item'
                            });
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: 'top-center'
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page when searching
        setIsSearching(true);

        // Add a small delay to show searching state
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setIsSearching(false);
        }, 500);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const formatPrice = (price) => {
        return typeof price === 'number' ? `$${price.toFixed(2)}` : price;
    };

    const formatStock = (stock, itemType) => {
        if (itemType === 'service') return 'N/A';
        return stock || 0;
    };

    const isLoading = loadingItems || loadingCategories;

    return (
        <>
            {/* Toast Container */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1f2937',
                        color: '#f9fafb',
                        border: '1px solid #374151',
                        borderRadius: '12px'
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#ffffff'
                        }
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#ffffff'
                        }
                    }
                }}
            />

            <div className="fade-in">
                <div className="dashboard-card-header">
                    <div>
                        <h1 className="dashboard-card-title">Shop Management</h1>
                        <p className="dashboard-card-subtitle">Manage your products and services catalog</p>
                    </div>
                    <button
                        className="button primary"
                        onClick={() => setShowAddModal(true)}
                        disabled={isLoading}
                    >
                        Add Item
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <div className="flex items-center justify-between">
                            <span>Error: {error}</span>
                            <div className="space-x-2">
                                <button
                                    onClick={retryLoadItems}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                    disabled={loadingItems}
                                >
                                    {loadingItems ? 'Retrying Items...' : 'Retry Items'}
                                </button>
                                <button
                                    onClick={retryLoadCategories}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                    disabled={loadingCategories}
                                >
                                    {loadingCategories ? 'Retrying Categories...' : 'Retry Categories'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filters */}
                {loadingCategories ? (
                    <SearchSkeletonLoader />
                ) : (
                    <div className="dashboard-card mb-4">
                        <form onSubmit={handleSearch} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Search Items</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name or description..."
                                    className="input"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="input"
                                    disabled={isLoading}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id || category.name} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="button secondary"
                                disabled={isLoading || isSearching}
                            >
                                {isSearching ? 'Searching...' : (loadingItems ? 'Loading...' : 'Search')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterCategory('');
                                    setCurrentPage(1);
                                }}
                                className="button outline"
                                disabled={isLoading}
                            >
                                Clear
                            </button>
                        </form>
                    </div>
                )}

                <div className="dashboard-card">
                    {loadingItems ? (
                        <ItemsSkeletonLoader />
                    ) : productList.length === 0 ? (
                        <EmptyState
                            icon={<Box className="w-16 h-16 text-gray-400" />}
                            title="No Items Found"
                            description="Start by adding your first product or service to the catalog."
                            actionButton={
                                <button
                                    className="button primary"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    Add Your First Item
                                </button>
                            }
                        />
                    ) : (
                        <>
                            <DataTable headers={['Item', 'Type', 'Category', 'Price', 'Stock', 'Status', 'Actions']}>
                                {productList.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {/* Product Image */}
                                                {product.images?.length > 0 || product.image ? (
                                                    <img
                                                        src={product.images?.[0]?.url || product.image}
                                                        alt={product.name}
                                                        className="w-12 h-12 rounded-lg object-cover border border-gray-300"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <span className="text-gray-400 text-xs">No Image</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">{product.name}</div>
                                                    {product.description && (
                                                        <div className="text-sm text-gray-600 truncate max-w-xs">
                                                            {product.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                product.item_type === 'service'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {product.item_type === 'service' ? 'Service' : 'Product'}
                                            </span>
                                        </td>
                                        <td>{product.category}</td>
                                        <td>{formatPrice(product.price)}</td>
                                        <td>{formatStock(product.stock, product.item_type)}</td>
                                        <td>
                                            <StatusBadge status={product.isActive ? 'active' : 'inactive'} />
                                        </td>
                                        <td>
                                            <ActionButtons
                                                onEdit={() => handleEditProduct(product.id)}
                                                onView={() => handleViewProduct(product.id)}
                                                onDelete={() => handleDeleteProduct(product.id)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </DataTable>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                    <div className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1 || loadingItems}
                                            className="button outline small"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages || loadingItems}
                                            className="button outline small"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Add Item Modal */}
                <ProductModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddProduct}
                    categories={categories}
                    mode="create"
                />

                {/* Edit Item Modal */}
                <ProductModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedProduct(null);
                    }}
                    onSave={handleUpdateProduct}
                    categories={categories}
                    mode="edit"
                    initialData={selectedProduct}
                />

                {/* Loading Indicator for ongoing operations */}
                {loadingItems && (
                    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span className="text-sm">
                                {loadingItems && loadingCategories ? 'Loading catalog data...' :
                                    loadingItems ? 'Loading items...' : 'Loading categories...'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CatalogManagement;
