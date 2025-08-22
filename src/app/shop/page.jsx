"use client"

import { useCart } from 'react-use-cart';
import Link from 'next/link';
import { toast } from "react-hot-toast";
import { motion } from 'framer-motion';
import { FaShoppingBag } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

function Shop() {
    const t = useTranslations('Shop');
    const { addItem, totalItems } = useCart();

    const items = [
        { id: 1, name: "Cool Tag", price: 9.99, image: "https://placehold.co/300x300" },
        { id: 2, name: "Collar + Tag", price: 14.99, image: "https://placehold.co/300x300" },
        { id: 3, name: "Bracelet Tag", price: 12.49, image: "https://placehold.co/300x300" },
    ];

    const addToCart = (product) => {
        addItem(product);
        toast.success(t('addedToCart', { productName: product.name }));
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 mb-10 mt-36">
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
                            {t('cart')} (<strong>{totalItems}</strong>)
                        </button>
                    </Link>
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
                            className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
                        >
                            <div className="w-full h-56 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
                                    {item.name}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    €{item.price.toFixed(2)}
                                </p>
                                <motion.button
                                    onClick={() => addToCart(item)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="button mt-auto"
                                >
                                    {t('addToCart')}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

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
