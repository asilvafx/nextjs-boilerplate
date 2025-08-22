import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import initializeBundleAnalyzer from '@next/bundle-analyzer';

// Analyzer
const withBundleAnalyzer = initializeBundleAnalyzer({
    enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true',
});

// Intl
const withNextIntl = createNextIntlPlugin(
    './src/i18n/requests.js'
);

// Base config
const nextConfig: NextConfig = {
    output: 'standalone',
};

// Compose plugins (order matters: rightmost runs first)
export default withBundleAnalyzer(
    withNextIntl(nextConfig)
);
