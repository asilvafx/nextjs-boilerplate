"use client"

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCart } from 'react-use-cart';
import { useState } from 'react';

const Header = () => {
    const t = useTranslations('Cart');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const {
        cartTotal,
        items,
        totalItems,
        updateItemQuantity,
        removeItem,
        emptyCart
    } = useCart();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="header">
            <div className={`header-navbar ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                <Link href="/" className="logo-container">
                    <div className="logo">
                        ST
                    </div>
                    <div>
                        <h1>Starlit Tarot</h1>
                        <p>Clear readings — gentle guidance — real results</p>
                    </div>
                </Link>

                {/* Mobile menu button */}
                <button
                    className="mobile-menu-toggle lg:hidden"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                >
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                </button>

                {/* Desktop actions */}
                <div className="header-actions desktop-actions">
                    <Link
                        href="/shop/cart"
                        className="button"
                    >
                        Cart ({totalItems})
                    </Link>
                    <a href="#booking" className="button primary">
                        Book now
                    </a>
                </div>

                {/* Mobile dropdown menu */}
                <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    <div className="mobile-menu-content">
                        <Link
                            href="/shop/cart"
                            className="button mobile-menu-item"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Cart ({totalItems})
                        </Link>
                        <a
                            href="#booking"
                            className="button primary mobile-menu-item"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Book now
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
