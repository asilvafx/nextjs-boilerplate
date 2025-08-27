import { useState, useEffect } from 'react';
import { fetchFeaturedProducts } from '../data/products';

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

            const response = await fetchFeaturedProducts(4); // Limit to 4 featured items

            if (response.success) {
                setProducts(response.data);
            } else {
                setError(response.message);
                // Fallback to empty array to prevent component breaking
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
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    product.category === 'service'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {product.category === 'service' ? 'Service' : 'Product'}
                                </span>
                                {product.featured && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                        Featured
                                    </span>
                                )}
                            </div>

                            <h4>
                                {product.name}
                                <span className="price">€{product.price.toFixed(2)}</span>
                            </h4>
                            <p className="text-xs">{product.description}</p>

                            {/* Stock indicator */}
                            <div className="mt-2">
                                <span className={`text-xs ${
                                    product.inStock
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}>
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
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
