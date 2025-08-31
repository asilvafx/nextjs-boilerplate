import { useState, useEffect } from 'react';
import { getAll } from '@/lib/query.js';

const ProductsSection = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFeaturedProducts();
    }, []);

    const loadFeaturedProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getAll('catalog', false, true);
console.log(response);
            if (response && response.success) {
                // Transform the data to match component expectations
                const transformedData = response.data.map(item => ({
                    ...item,
                    // Add inStock property based on stock number
                    inStock: item.stock !== 0,
                    // Ensure we have the right image URL
                    image: item.image || (item.images?.[0]?.url) || '/placeholder-image.jpg',
                    // Transform item_type to category for display
                    category: item.item_type || item.category || 'general'
                }));

                // Filter for featured products only, or limit to 4 if no featured field exists
                const featuredProducts = transformedData.filter(item => item.featured === true);

                // If no featured products, take first 4 items
                const displayProducts = featuredProducts.length > 0
                    ? featuredProducts.slice(0, 4)
                    : [];

                setProducts(displayProducts);
            } else {
                setError('Failed to load products');
                setProducts([]);
            }
        } catch (err) {
            setError('Failed to load featured products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="card">
                <div id="products">
                    <h3>Featured Products & Services</h3>
                    <div className="products-grid">
                        {/* Loading skeleton */}
                        {[1, 2, 3, 4].map((index) => (
                            <div key={index} className="product-card animate-pulse">
                                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && products.length === 0) {
        return (
            <div className="card">
                <div id="products">
                    <h3>Featured Products & Services</h3>
                    <div className="text-center py-4">
                        <p className="text-red-600 mb-2">{error}</p>
                        <button
                            onClick={loadFeaturedProducts}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div id="products">
                <h3>Featured Products & Services</h3>
                <div className="products-grid">
                    {products.map((product) => (
                        <div key={product.id} className="product-card">
                            {/* Category and featured indicators */}
                            <div className="flex items-center justify-between mb-2">

                            </div>

                            {/* Product image */}
                            {product.image && (
                                <div className="mb-2">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-32 object-cover rounded"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                </div>
                            )}

                            <h4>
                                {product.name}
                            </h4>
                            <p className="text-xs">{product.description}</p>

                            {/* Stock indicator */}
                            <div className="mt-2 flex items-center justify-between">
                                <span className={`text-xs ${
                                    product.inStock
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}>
                                    {product.inStock
                                        ? `In Stock`
                                        : 'Out of Stock'
                                    }
                                </span>

                                <span className="price">€{product.price.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No products message */}
                {products.length === 0 && !loading && !error && (
                    <div className="text-center py-4">
                        <p className="text-gray-600">No featured products available at the moment.</p>
                    </div>
                )}

                {/* Show all products link */}
                {products.length > 0 && (
                    <div className="text-center mt-4">
                        <a
                            href="/shop"
                            className="text-blue-600 hover:underline text-sm"
                        >
                            View All Products & Services →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsSection;
