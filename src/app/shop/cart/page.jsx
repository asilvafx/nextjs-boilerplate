"use client"

import { useCart } from 'react-use-cart';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus, FaTrash, FaShoppingBag } from 'react-icons/fa';

const Cart = () => {
    const t = useTranslations('Cart');
    const {
        cartTotal,
        items,
        totalItems,
        updateItemQuantity,
        removeItem,
        emptyCart
    } = useCart();

    const shippingCost = 5.99;
    const totalPrice = (cartTotal + shippingCost).toFixed(2);

    const handleQuantityIncrease = (id, currentQuantity) => {
        updateItemQuantity(id, currentQuantity + 1);
    };

    const handleQuantityDecrease = (id, currentQuantity) => {
        if (currentQuantity > 1) {
            updateItemQuantity(id, currentQuantity - 1);
        }
    };

    const handleRemoveItem = (id) => {
        removeItem(id);
    };

    const handleEmptyCart = () => {
        if (window.confirm(t('confirmEmptyCart'))) {
            emptyCart();
        }
    };

    return (
        <>
            <div className="section">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {totalItems > 0 && (
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-bold">{t('title')}</h1>

                            <span
                                onClick={handleEmptyCart}
                                className="bg-transparent text-sm text-red-500 hover:text-red-700 transition-colors duration-200 font-medium"
                            >
                                {t('emptyCart')}
                            </span>
                    </div>
                    )}

                    {totalItems === 0 ? (
                        // Empty Cart State
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center py-16"
                        >
                            <div className="mb-8">
                                <FaShoppingBag className="mx-auto text-8xl text-gray-300 dark:text-gray-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                                {t('emptyCartTitle')}
                            </h2>
                            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                {t('emptyCartMessage')}
                            </p>
                            <Link
                                href="/shop"
                                className="button"
                            >
                                <FaShoppingBag className="mr-2" />
                                {t('goToShop')}
                            </Link>
                        </motion.div>
                    ) : (
                        // Cart with Items
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2">
                                <div className="card">
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                        <h2 className="text-xl font-semibold">
                                            {t('items', { count: totalItems })}
                                        </h2>
                                    </div>

                                    <AnimatePresence>
                                        {items.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                className="p-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    {/* Product Image */}
                                                    {item.image && (
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                            {item.name}
                                                        </h3>
                                                        <div className="mt-1 space-y-1">
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {t('unitPrice', { price: item.price.toFixed(2) })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                                            <button
                                                                onClick={() => handleQuantityDecrease(item.id, item.quantity)}
                                                                className="p-2 bg-transparent transition-colors duration-200 rounded-l-lg"
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <FaMinus className="w-3 h-3 text-dark dark:text-light" />
                                                            </button>
                                                            <span className="px-4 py-2 font-semibold bg-gray-50 dark:bg-neutral-800 min-w-[50px] text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => handleQuantityIncrease(item.id, item.quantity)}
                                                                className="p-2 bg-transparent transition-colors duration-200 rounded-r-lg"
                                                            >
                                                                <FaPlus className="w-3 h-3 text-dark dark:text-light" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Price & Remove */}
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                                            €{(item.price * item.quantity).toFixed(2)}
                                                        </p>
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="text-red-500 bg-transparent hover:text-red-700 transition-colors duration-200 p-1"
                                                            title={t('removeItem')}
                                                        >
                                                            <FaTrash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                    className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-6 h-fit sticky top-4"
                                >
                                    <h2 className="text-xl font-semibold mb-6">{t('orderSummary')}</h2>

                                    {/* Price Breakdown */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                            <span>{t('subtotal', { count: totalItems })}</span>
                                            <span>€{cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                            <span>{t('shipping')}</span>
                                            <span>€{shippingCost.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                                            <div className="flex justify-between text-xl font-bold">
                                                <span>{t('total')}</span>
                                                <span>€{totalPrice}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        <Link
                                            href="/shop/checkout"
                                            className="button primary w-full"
                                        >
                                            {t('proceedToCheckout')}
                                        </Link>
                                        <Link
                                            href="/shop"
                                            className="button w-full"
                                        >
                                            {t('continueShopping')}
                                        </Link>
                                    </div>

                                    {/* Security Notice */}
                                    <div className="mt-6 p-3 bg-neutral-300/20 dark:bg-neutral-600/20 rounded-lg">
                                        <div className="flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                            <span>{t('securePayment')}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
};

export default Cart;
