import Link from 'next/link';

const Header = () => {
    return (
        <header className="header">
            <div className="logo-container">
                <div className="logo">
                    ST
                </div>
                <div>
                    <h1>Starlit Tarot</h1>
                    <p>Clear readings — gentle guidance — real results</p>
                </div>
            </div>
            <div className="header-actions">
                <span className="badge">
                    30‑min intro: Free
                </span>
                <a href="#booking" className="button primary">
                    Book now
                </a>
            </div>
        </header>
    );
};

export default Header;
