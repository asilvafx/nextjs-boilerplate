"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from 'react-use-cart';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { generatePDF } from '@/utils/generatePDF.js';

const PaymentSuccess = () => {
    const t = useTranslations('Checkout');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { emptyCart } = useCart();
    const [orderDetails, setOrderDetails] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [emailSent, setEmailSent] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);

    // Use ref to track if we've already processed the order
    const hasProcessedOrder = useRef(false);

    // Get order ID from URL parameters
    const orderId = searchParams.get('tx');

    // Function to send order confirmation email and save to DB
    const processOrderAndSendEmail = async (orderData) => {
        try {
            setEmailLoading(true);

            // Prepare the complete payload with both orderData and emailPayload
            const payload = {
                // Complete order data for DB storage
                orderData: {
                    uid: orderData.uid || atob(orderId),
                    tx: orderData.tx,
                    cst_email: orderData.cst_email,
                    cst_name: orderData.cst_name,
                    items: orderData.items,
                    amount: orderData.amount,
                    subtotal: orderData.subtotal,
                    shipping: orderData.shipping,
                    totalItems: orderData.totalItems,
                    shipping_address: orderData.shipping_address,
                    currency: orderData.currency || 'eur',
                    method: orderData.method || 'Carte bancaire',
                    status: orderData.status || 'Confirmé',
                    created_at: new Date().toISOString(),
                    // Add any other fields from your orderData
                    ...orderData
                },
                // Email payload for sending confirmation email
                emailPayload: {
                    email: orderData.cst_email,
                    customerName: orderData.cst_name,
                    orderId: orderData.uid || atob(orderId),
                    orderDate: new Date().toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    items: typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items,
                    subtotal: orderData.subtotal,
                    shippingCost: orderData.shipping,
                    total: orderData.amount,
                    shippingAddress: typeof orderData.shipping_address === 'string'
                        ? JSON.parse(orderData.shipping_address)
                        : orderData.shipping_address,
                }
            };

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "x-internal-secret": process.env.NEXT_PUBLIC_API_KEY,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setEmailSent(true);
            } else {
                console.error('Failed to process order and send email:', result);
                // Don't set error here as it's not critical for the payment success page
            }
        } catch (error) {
            console.error('Error processing order and sending email:', error);
            // Don't set error here as it's not critical for the payment success page
        } finally {
            setEmailLoading(false);
        }
    };

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessedOrder.current) {
            return;
        }

        const fetchOrder = async () => {
            try {
                // Try to get order data from localStorage first
                const storedOrderData = localStorage.getItem('orderData');
                if (storedOrderData) {
                    const orderData = JSON.parse(storedOrderData);

                    if (!orderId || orderData.uid !== atob(orderId)) {
                        setError(t('orderNotFound'));
                        setLoading(false);
                        return;
                    }

                    const orderDetailsData = {
                        orderId: orderData.uid || atob(orderId),
                        paymentIntentId: orderData.tx,
                        email: orderData.cst_email,
                        customerName: orderData.cst_name,
                        items: typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items,
                        total: orderData.amount,
                        subtotal: orderData.subtotal,
                        shipping: orderData.shipping,
                        totalItems: orderData.totalItems,
                        shippingAddress: typeof orderData.shipping_address === 'string'
                            ? JSON.parse(orderData.shipping_address)
                            : orderData.shipping_address,
                        orderDate: new Date().toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    };

                    // Mark as processed BEFORE setting state to prevent race conditions
                    hasProcessedOrder.current = true;

                    setOrderDetails(orderDetailsData);

                    // Process order (save to DB) and send confirmation email
                    await processOrderAndSendEmail(orderData);

                    // Clear cart and stored order data AFTER everything is processed
                    emptyCart();
                    localStorage.removeItem('orderData');
                } else {
                    setError(t('orderDataNotFound'));
                }
            } catch (e) {
                console.error('Error fetching order:', e);
                setError(t('orderRetrievalError'));
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, emptyCart]); // Keep dependencies but use ref to prevent re-execution

    const handleContinue = () => {
        router.push('/');
    };

    const handleViewOrders = () => {
        router.push('/account/orders'); // Adjust path as needed
    };

    const downloadReceipt = () => {
        if (!orderDetails) return;

        // Create order object compatible with generatePDF function
        const orderForPDF = {
            uid: orderDetails.orderId,
            created_at: orderDetails.orderDate,
            cst_name: orderDetails.customerName,
            cst_email: orderDetails.email,
            shipping_address: JSON.stringify(orderDetails.shippingAddress),
            items: JSON.stringify(orderDetails.items),
            amount: parseFloat(orderDetails.total).toFixed(2),
            currency: 'eur',
            method: 'Carte bancaire',
            status: 'Confirmé'
        };

        generatePDF(orderForPDF);
    };

    const resendConfirmationEmail = async () => {
        if (!orderDetails) return;

        // Get original order data from localStorage or reconstruct it
        const storedOrderData = localStorage.getItem('orderData');
        if (storedOrderData) {
            const orderData = JSON.parse(storedOrderData);
            await processOrderAndSendEmail(orderData);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-3xl mx-auto mt-36 p-8 flex justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto mt-36 p-8 mb-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="mx-auto w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white text-4xl mb-6"
                >
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </motion.div>

                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('paymentSuccessTitle')}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                    {t('paymentSuccessMessage')}
                </p>

                {/* Email Status */}
                {emailLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mb-4"
                    >
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">{t('sendingConfirmationEmail')}</span>
                    </motion.div>
                )}

                {emailSent && !emailLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-4"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{t('confirmationEmailSent')}</span>
                    </motion.div>
                )}

                {error ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8"
                    >
                        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                        <div className="mt-6">
                            <button
                                onClick={handleContinue}
                                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
                            >
                                {t('backToHome')}
                            </button>
                        </div>
                    </motion.div>
                ) : orderDetails && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-left mb-8"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-semibold mb-2">{t('orderDetailsTitle')}</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('orderNumber')}: <span className="font-mono font-medium">{orderDetails.orderId}</span>
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('orderDate')}: {orderDetails.orderDate}
                            </p>
                        </div>

                        {/* Customer Information */}
                        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h3 className="font-semibold mb-3">{t('customerInformation')}</h3>
                            <p><strong>{t('name')}:</strong> {orderDetails.customerName}</p>
                            <p><strong>{t('email')}:</strong> {orderDetails.email}</p>
                        </div>

                        {/* Order Items */}
                        <div className="mb-8">
                            <h3 className="font-semibold mb-4">{t('orderedItems')}</h3>
                            <div className="space-y-4">
                                {orderDetails.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-12 h-12 object-cover rounded-md"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {t('quantity')}: {item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>{t('subtotal')}</span>
                                    <span>€{orderDetails.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>{t('shipping')}</span>
                                    <span>€{orderDetails.shipping}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold border-t border-gray-200 dark:border-gray-600 pt-3">
                                    <span>{t('total')}</span>
                                    <span>€{parseFloat(orderDetails.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Action Buttons */}
                {!error && orderDetails && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <button
                            onClick={handleContinue}
                            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
                        >
                            {t('continueShopping')}
                        </button>
                        <button
                            onClick={downloadReceipt}
                            className="inline-flex bg-neutral-900"
                        >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            {t('downloadReceipt')}
                        </button>
                    </motion.div>
                )}

                {/* Resend Email Button */}
                {!error && orderDetails && !emailLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 text-center"
                    >
                    </motion.div>
                )}

                {/* Back to Shop Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8"
                >
                    <Link
                        href="/shop"
                        className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors duration-200"
                    >
                        ← {t('backToShop')}
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
