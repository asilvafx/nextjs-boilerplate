// app/dashboard/components/sections/ProductsSection.jsx
"use client"
import { useState, useEffect } from 'react';
import { useShopAPI } from '@/lib/shop.js';
import ProductModal from '../modals/ProductModal';
import { DataTable, StatusBadge, ActionButtons, EmptyState } from '../common/Common';
import toast, { Toaster } from 'react-hot-toast';

const ProductsSection = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productList, setProductList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const {
        loading,
        error,
        getAllItems,
        getCategories,
        createItem,
        updateItem,
        deleteItem
    } = useShopAPI();

    // Load initial data
    useEffect(() => {
        loadProducts();
        loadCategories();
    }, [currentPage, searchTerm, filterCategory]);

    const loadProducts = async () => {
        const loadingToast = toast.loading('Loading products...');

        try {
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
            }
        } catch (err) {
            console.error('Error loading products:', err);
            toast.error('Failed to load products', { id: loadingToast });
        }
    };

    const loadCategories = async () => {
        try {
            const response = await getCategories();
            if (response && response.success) {
                setCategories(response.data);
            }
        } catch (err) {
            console.error('Error loading categories:', err);
            toast.error('Failed to load categories');
        }
    };

    const handleAddProduct = async (productData) => {
        try {
            const response = await createItem(productData);
            if (response && response.success) {
                setShowAddModal(false);
                await loadProducts(); // Refresh the list
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
                await loadProducts(); // Refresh the list
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
                                        await loadProducts();
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
        loadProducts();
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
                        disabled={loading}
                    >
                        Add Item
                    </button>
                </div>

                {/* Search and Filters */}
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
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="input"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id || category.name} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="button secondary" disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                                setFilterCategory('');
                                setCurrentPage(1);
                            }}
                            className="button outline"
                            disabled={loading}
                        >
                            Clear
                        </button>
                    </form>
                </div>

                <div className="dashboard-card">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            Error: {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <p className="mt-2">Loading items...</p>
                        </div>
                    ) : productList.length === 0 ? (
                        <EmptyState
                            icon="📦"
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
                                            disabled={currentPage === 1 || loading}
                                            className="button outline small"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages || loading}
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
            </div>
        </>
    );
};

export default ProductsSection;
