"use client"

import { useCart } from 'react-use-cart';
import Link from 'next/link';
import { toast } from "react-hot-toast";
import { motion } from 'framer-motion';
import { FaShoppingBag, FaSpinner } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { fetchProducts } from '../data/products';

function Shop() {
    const t = useTranslations('Shop');
    const { addItem, cartTotal, totalItems } = useCart();

    // State management
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    // Fetch products on component mount
    useEffect(() => {
        loadProducts();
    }, [filter]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetchProducts({
                category: filter,
                inStock: true // Only show available items
            });

            if (response.success) {
                setItems(response.data);
            } else {
                setError(response.message);
                toast.error(response.message);
            }
        } catch (err) {
            const errorMessage = 'Failed to load products';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        addItem(product);
        toast.success(t('addedToCart', { productName: product.name }));
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    // Loading state
    if (loading) {
        return (
            <div className="section">
                <div className="flex items-center justify-center min-h-64">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="text-4xl text-blue-600"
                    >
                        <FaSpinner />
                    </motion.div>
                    <span className="ml-4 text-lg">Loading products...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error && items.length === 0) {
        return (
            <div className="section">
                <div className="text-center">
                    <div className="text-red-600 mb-4">
                        <h2 className="text-2xl font-bold mb-2">Error Loading Products</h2>
                        <p>{error}</p>
                    </div>
                    <button
                        onClick={loadProducts}
                        className="button"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="section">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold">{t('shopTitle')}</h1>
                    <Link href="/shop/cart">
                        <button className="button flex items-center gap-2">
                            <FaShoppingBag />
                            Checkout - {parseFloat(cartTotal).toFixed(2)} $
                        </button>
                    </Link>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {[
                        { value: 'all', label: 'All Items' },
                        { value: 'product', label: 'Products' },
                        { value: 'service', label: 'Services' }
                    ].map((filterOption) => (
                        <button
                            key={filterOption.value}
                            onClick={() => handleFilterChange(filterOption.value)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filter === filterOption.value
                                    ? 'primary'
                                    : 'secondary'
                            }`}
                        >
                            {filterOption.label}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="card relative"
                        >
                            {/* Category Badge */}
                            <div className="absolute top-2 right-2 z-10">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    item.category === 'service'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                }`}>
                                    {item.category === 'service' ? 'Service' : 'Product'}
                                </span>
                            </div>

                            {/* Featured Badge */}
                            {item.featured && (
                                <div className="absolute top-2 left-2 z-10">
                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                        Featured
                                    </span>
                                </div>
                            )}

                            <div className="w-full h-56 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </div>
                            <div className="p-2 flex flex-col flex-grow">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    {item.name}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-grow">
                                    {item.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                        €{item.price.toFixed(2)}
                                    </p>
                                    <motion.button
                                        onClick={() => addToCart(item)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={!item.inStock}
                                        className={`button ${
                                            !item.inStock
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                        }`}
                                    >
                                        {item.inStock ? t('addToCart') : 'Out of Stock'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* No items message */}
                {items.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            No items found for the selected filter.
                        </p>
                    </div>
                )}

                {/* Back link */}
                <div className="mt-10 text-center">
                    <Link
                        href="/"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        ← {t('backToHome')}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default Shop;
