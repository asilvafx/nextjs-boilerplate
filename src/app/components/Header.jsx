"use client"

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCart } from 'react-use-cart';

const Header = () => {
    const t = useTranslations('Cart');
    const {
        cartTotal,
        items,
        totalItems,
        updateItemQuantity,
        removeItem,
        emptyCart
    } = useCart();

    return (
        <header className="header">
            <div className="header-navbar">
            <Link href="/" className="logo-container">
                <div className="logo">
                    ST
                </div>
                <div>
                    <h1>Starlit Tarot</h1>
                    <p>Clear readings — gentle guidance — real results</p>
                </div>
            </Link>
                <div className="header-actions">
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
            </div>
        </header>
    );
};

export default Header;
