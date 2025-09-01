"use client"

import { useState, useEffect } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import 'react-phone-input-2/lib/style.css'
import PhoneInput from 'react-phone-input-2'
import { useCart } from 'react-use-cart';
import { useTranslations } from 'next-intl';
import {useAuth} from '@/hooks/useAuth.js';
import { COUNTRIES } from '@/lib/countries.js';
import CountrySelector from '@/app/ui/CountrySelector';

const PaymentForm = ({ cartTotal, subTotal, shippingCost }) => {
    const t = useTranslations('Checkout');
    const { user, isAuthenticated } = useAuth();
    const stripe = useStripe();
    const elements = useElements();
    const { items } = useCart();

    const [isOpen, setIsOpen] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Contact information
    const [emailInput, setEmailInput] = useState(isAuthenticated ? user.email : '');

    // Shipping information
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [apartmentUnit, setApartmentUnit] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [countryIso, setCountryIso] = useState('FR');
    const [country, setCountry] = useState('FR');
    const [phone, setPhone] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        try {
            if(!emailInput){
                setErrorMessage(t('emailRequired'));
                setIsProcessing(false);
                return;
            }

            // Validate the form
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setErrorMessage(submitError.message);
                setIsProcessing(false);
                return;
            }

            // Calculate the price in cents
            const priceInCents = Math.round(cartTotal * 100);

            // Create the PaymentIntent on your backend
            const response = await fetch(`/api/stripe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currency: 'eur',
                    email: emailInput,
                    amount: priceInCents,
                    paymentMethodType: "card"
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('paymentError'));
                setIsProcessing(false);
            }

            const { client_secret: clientSecret } = await response.json();

            // Confirm the payment
            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/shop/checkout/success`,
                    receipt_email: emailInput,
                },
                redirect: 'if_required'
            });

            if (confirmError) {
                setErrorMessage(confirmError.message);
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Prepare shipping address
                const shippingAddress = {
                    name: `${firstName} ${lastName}`,
                    street: streetAddress,
                    apartment: apartmentUnit,
                    city: city,
                    state: state,
                    zip: zipCode,
                    country: country,
                    phone: phone
                };

                // Format cart items for order storage
                const orderItems = items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    sku: item.sku || null,
                    image: item.image || null,
                }));

                const orderId = `ORD-${paymentIntent.created}-${Math.floor(Math.random() * 1000)}`;

                // Prepare order data for insertion
                const newOrderData = {
                    uid: orderId,
                    cst_email: emailInput,
                    cst_name: `${firstName} ${lastName}`,
                    tx: paymentIntent.id,
                    amount: paymentIntent.amount / 100,
                    subtotal: subTotal,
                    shipping: shippingCost,
                    currency: paymentIntent.currency,
                    method: paymentIntent.payment_method_types[0],
                    created_at: paymentIntent.created,
                    status: "pending",
                    tracking: "",
                    shipping_address: JSON.stringify(shippingAddress),
                    delivery_notes: deliveryNotes,
                    items: JSON.stringify(orderItems),
                    ref: localStorage.getItem('ref') || ''
                }

                localStorage.setItem('orderData', JSON.stringify(newOrderData));

                // Insert the new order into the database
                //await DBService.create(newOrderData, 'orders');
                window.location.href = `${window.location.origin}/shop/checkout/success?tx=${btoa(orderId)}`;
            }
        } catch (err) {
            setErrorMessage(err.message || t('unexpectedError'));
            setIsProcessing(false);
        }
    };

    const getDefaultCountry = (countryCode=null) => {
        let lang = navigator.language || 'en-US';
        if(countryCode){
            lang = countryCode.code;
            setCountry(countryCode.name);
            setCountryIso(lang);
        }
        const country = lang.split('-')[1] || 'US';

        const fallback = 'US';
        const supportedCountries = ['US', 'CA', 'GB', 'FR', 'DE', 'AU', 'PT', 'ES'];

        return supportedCountries.includes(country) ? country : fallback;
    };

    useEffect(() => {
        const defaultC = getDefaultCountry();
        setCountry(defaultC);
    }, []);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Contact Information */}
            <div>
                <h2 className="text-lg font-semibold mb-2">{t('contactInformation')}</h2>
                <div className="space-y-4">
                    <input
                        required
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder={t('emailAddress')}
                        className="w-full border rounded-xl px-3 py-2"
                    />
                    <PhoneInput
                        required
                        country={countryIso.toLowerCase()}
                        value={phone}
                        onChange={setPhone}
                        inputStyle={{ width: "100%" }}
                        containerClass="phone-input-container"
                        buttonClass="phone-input-button"
                    />
                </div>
            </div>

            {/* Shipping Information */}
            <div>
                <h2 className="text-lg font-semibold mb-2">{t('shippingInformation')}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        required
                        type="text"
                        placeholder={t('firstName')}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border rounded-xl px-3 py-2 w-full"
                    />
                    <input
                        required
                        type="text"
                        placeholder={t('lastName')}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="border rounded-xl px-3 py-2 w-full"
                    />
                    <input
                        required
                        type="text"
                        placeholder={t('streetAddress')}
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="col-span-2 border rounded-xl px-3 py-2 w-full"
                    />
                    <input
                        type="text"
                        placeholder={t('apartmentUnit')}
                        value={apartmentUnit}
                        onChange={(e) => setApartmentUnit(e.target.value)}
                        className="col-span-2 border rounded-xl px-3 py-2 w-full"
                    />
                    <input
                        required
                        type="text"
                        placeholder={t('city')}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="border rounded-xl px-3 py-2 w-full"
                    />
                    <input
                        required
                        type="text"
                        placeholder={t('stateProvince')}
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="border rounded-xl px-3 py-2 w-full"
                    />
                    <input
                        required
                        type="text"
                        placeholder={t('zipPostalCode')}
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="border rounded-xl px-3 py-2 w-full"
                    />
                    <div className="w-full">
                        <CountrySelector
                            id={'countries'}
                            open={isOpen}
                            onToggle={() => setIsOpen(!isOpen)}
                            onChange={val => setCountry(val)}
                            selectedValue={COUNTRIES.find(option => option.value === country)}
                        />
                    </div>
                </div>
            </div>

            {/* Delivery Notes */}
            <div>
                <h2 className="text-lg font-semibold mb-2">{t('deliveryNotes')}</h2>
                <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder={t('deliveryInstructions')}
                    className="w-full border rounded-xl px-3 py-2"
                    rows="3"
                />
            </div>

            {/* Payment Element Section */}
            <div>
                <h2 className="text-lg font-semibold mb-2">{t('cardInformation')}</h2>
                <PaymentElement
                theme="dark"
                />
            </div>

            {/* Submit Button */}
            <button
                className="w-full primary"
                type="submit"
                disabled={!stripe || !elements || isProcessing}
            >
                {isProcessing ? t('processing') : t('payButton', { amount: cartTotal })}
            </button>

            {/* Error Message */}
            {errorMessage && (
                <div className="text-red-600 mt-2 text-sm text-center">{errorMessage}</div>
            )}
        </form>
    );


};

export default PaymentForm;
