// ui/GDPRCookies.jsx
"use client";

import { useCallback, useEffect, useState } from "react";

export default function GDPRCookies() {
    const GA_ID = "G-XXXXXXX"; // <-- replace with your GA ID
    const [showBanner, setShowBanner] = useState(false);
    const [showBannerOptions, setShowBannerOptions] = useState(false);

    const [preferences, setPreferences] = useState({
        necessary: true,
        statistics: false,
        marketing: false
    });

    // Check if consent was already given
    useEffect(() => {
        const consent = localStorage.getItem('gdpr-consent');
        if (!consent) {
            setShowBanner(true);
        } else {
            const savedPreferences = JSON.parse(consent);
            setPreferences(savedPreferences);
            if (savedPreferences.statistics) {
                loadGoogleAnalytics();
            }
        }
    }, []);

    const loadGoogleAnalytics = useCallback(() => {
        if (document.getElementById("ga-script")) return;

        const script = document.createElement("script");
        script.id = "ga-script";
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() {
            window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag("js", new Date());
        gtag("config", GA_ID);
    }, [GA_ID]);

    const removeGoogleAnalytics = useCallback(() => {
        const script = document.getElementById("ga-script");
        if (script) {
            script.remove();
        }
        // Clear GA globals
        delete window.gtag;
        delete window.dataLayer;

        // Clear GA cookies
        const cookies = document.cookie.split(";");
        cookies.forEach((cookie) => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name.startsWith("_ga") || name.startsWith("_gid")) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            }
        });

    }, []);

    const handleAcceptAll = useCallback(() => {
        const newPreferences = {
            necessary: true,
            statistics: true,
            marketing: true
        };
        setPreferences(newPreferences);
        localStorage.setItem('gdpr-consent', JSON.stringify(newPreferences));
        setShowBanner(false);
        loadGoogleAnalytics();
    }, [loadGoogleAnalytics]);

    const handleAcceptSelection = useCallback(() => {
        if(showBannerOptions) {
        localStorage.setItem('gdpr-consent', JSON.stringify(preferences));
        setShowBanner(false);

        if (preferences.statistics) {
            loadGoogleAnalytics();
        } else {
            removeGoogleAnalytics();
        }
        } else {
            setShowBannerOptions(true);
        }
    }, [preferences, loadGoogleAnalytics, removeGoogleAnalytics]);

    const handleDeclineAll = useCallback(() => {
        const newPreferences = {
            necessary: true,
            statistics: false,
            marketing: false
        };
        setPreferences(newPreferences);
        localStorage.setItem('gdpr-consent', JSON.stringify(newPreferences));
        setShowBanner(false);
        removeGoogleAnalytics();
    }, [removeGoogleAnalytics]);

    const updatePreference = useCallback((type, value) => {
        setPreferences(prev => ({
            ...prev,
            [type]: value
        }));
    }, []);

    if (!showBanner) return null;

    return (
        <div className="gdpr-banner">
            <div className="gdpr-banner-container">
                <div className="gdpr-banner-content">
                    <div className="gdpr-banner-header">
                        <div className="gdpr-banner-text">
                            <span className="gdpr-banner-title">
                                We use cookies
                            </span>
                            <p>
                                We use cookies to improve your experience. Manage your preferences below.{" "}
                                <a
                                    href="/privacy-policy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Privacy Policy
                                </a>
                            </p>
                        </div>

                        <div className="gdpr-banner-actions">
                            <button
                                onClick={handleDeclineAll}
                                className="gdpr-btn gdpr-btn-decline"
                            >
                                Decline All
                            </button>
                            <button
                                onClick={handleAcceptSelection}
                                className="gdpr-btn gdpr-btn-accept"
                            >
                                {showBannerOptions ? (
                                    `Accept Selection`
                                ) : (
                                    `Manage Selection`
                                )}
                            </button>
                            <button
                                onClick={handleAcceptAll}
                                className="gdpr-btn gdpr-btn-accept-all"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>

                    {showBannerOptions && (
                    <div className="gdpr-preferences-grid">
                        <div className="gdpr-preference-item">
                            <div className="gdpr-preference-content">
                                <strong>Necessary</strong>
                                <p>Required for basic functionality</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={true}
                                disabled
                                className="gdpr-preference-checkbox"
                            />
                        </div>

                        <div className="gdpr-preference-item">
                            <div className="gdpr-preference-content">
                                <strong>Statistics</strong>
                                <p>Help us understand usage</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.statistics}
                                onChange={(e) => updatePreference('statistics', e.target.checked)}
                                className="gdpr-preference-checkbox"
                            />
                        </div>

                        <div className="gdpr-preference-item">
                            <div className="gdpr-preference-content">
                                <strong>Marketing</strong>
                                <p>Personalized content</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.marketing}
                                onChange={(e) => updatePreference('marketing', e.target.checked)}
                                className="gdpr-preference-checkbox"
                            />
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}
