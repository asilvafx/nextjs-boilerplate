"use client"

import { useTranslations } from 'next-intl';
import { useCart } from 'react-use-cart';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import ProductsSection from '../components/ProductsSection';
import CTABanner from '../components/CTABanner';
import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';

const Homepage = () => {
    const t = useTranslations('HomePage');
    const { items, removeItem, totalItems, cartTotal, emptyCart, updateItemQuantity } = useCart();

    return (
        <div className="container">
            <div className="screen">
                <Header />

                <div className="main-grid">
                    {/* Main Content */}
                    <div className="main-content">
                        <HeroSection />
                        <ProductsSection />
                        <CTABanner />
                    </div>

                    {/* Booking Sidebar */}
                    <div className="sidebar">
                        <BookingForm />
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default Homepage;
