// lib/products.js

// Mock data for products and services
const mockProducts = [
    {
        id: 1,
        name: "Cool Tag",
        price: 9.99,
        description: "Stylish and durable pet identification tag",
        image: "https://placehold.co/300x300",
        category: "product",
        inStock: true,
        featured: false
    },
    {
        id: 2,
        name: "Collar + Tag",
        price: 14.99,
        description: "Premium collar with matching identification tag",
        image: "https://placehold.co/300x300",
        category: "product",
        inStock: true,
        featured: true
    },
    {
        id: 3,
        name: "Bracelet Tag",
        price: 12.49,
        description: "Elegant bracelet-style pet tag for small pets",
        image: "https://placehold.co/300x300",
        category: "product",
        inStock: true,
        featured: false
    },
    {
        id: 4,
        name: "Tarot Reading Guide",
        price: 15.00,
        description: "Complete beginner's guide to understanding tarot cards",
        image: "https://placehold.co/300x300",
        category: "service",
        inStock: true,
        featured: true
    },
    {
        id: 5,
        name: "Crystal Set Bundle",
        price: 45.00,
        description: "Curated collection of healing crystals for meditation",
        image: "https://placehold.co/300x300",
        category: "product",
        inStock: true,
        featured: false
    },
    {
        id: 6,
        name: "Spiritual Journal",
        price: 25.00,
        description: "Guided journal for spiritual growth and self-reflection",
        image: "https://placehold.co/300x300",
        category: "product",
        inStock: false,
        featured: false
    },
    {
        id: 7,
        name: "Meditation Audio Pack",
        price: 30.00,
        description: "Personalized meditation recordings for daily practice",
        image: "https://placehold.co/300x300",
        category: "service",
        inStock: true,
        featured: true
    },
    {
        id: 8,
        name: "Personal Consultation",
        price: 75.00,
        description: "One-on-one spiritual guidance and life coaching session",
        image: "https://placehold.co/300x300",
        category: "service",
        inStock: true,
        featured: false
    }
];

// Simulate network delay
const simulateNetworkDelay = (min = 300, max = 1000) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

// Simulate occasional network errors (5% chance)
const simulateNetworkError = () => {
    if (Math.random() < 0.05) {
        throw new Error('Network error: Unable to fetch products');
    }
};

/**
 * Fetch all products and services
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category ('product', 'service', or 'all')
 * @param {boolean} options.inStock - Filter by stock availability
 * @param {boolean} options.featured - Filter by featured status
 * @param {number} options.limit - Limit number of results
 * @returns {Promise<Object>} Promise resolving to products data
 */
export const fetchProducts = async (options = {}) => {
    try {
        await simulateNetworkDelay();
        simulateNetworkError();

        let filteredProducts = [...mockProducts];

        // Apply filters
        if (options.category && options.category !== 'all') {
            filteredProducts = filteredProducts.filter(
                product => product.category === options.category
            );
        }

        if (typeof options.inStock === 'boolean') {
            filteredProducts = filteredProducts.filter(
                product => product.inStock === options.inStock
            );
        }

        if (typeof options.featured === 'boolean') {
            filteredProducts = filteredProducts.filter(
                product => product.featured === options.featured
            );
        }

        // Apply limit
        if (options.limit && options.limit > 0) {
            filteredProducts = filteredProducts.slice(0, options.limit);
        }

        return {
            success: true,
            data: filteredProducts,
            total: filteredProducts.length,
            message: 'Products fetched successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: [],
            total: 0,
            message: error.message || 'Failed to fetch products'
        };
    }
};

/**
 * Fetch a single product by ID
 * @param {number} id - Product ID
 * @returns {Promise<Object>} Promise resolving to product data
 */
export const fetchProductById = async (id) => {
    try {
        await simulateNetworkDelay();
        simulateNetworkError();

        const product = mockProducts.find(item => item.id === parseInt(id));

        if (!product) {
            throw new Error(`Product with ID ${id} not found`);
        }

        return {
            success: true,
            data: product,
            message: 'Product fetched successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.message || 'Failed to fetch product'
        };
    }
};

/**
 * Fetch featured products
 * @param {number} limit - Maximum number of featured products to return
 * @returns {Promise<Object>} Promise resolving to featured products
 */
export const fetchFeaturedProducts = async (limit = 4) => {
    return fetchProducts({ featured: true, limit });
};

/**
 * Search products by name or description
 * @param {string} query - Search query
 * @param {Object} options - Additional filter options
 * @returns {Promise<Object>} Promise resolving to search results
 */
export const searchProducts = async (query, options = {}) => {
    try {
        await simulateNetworkDelay();
        simulateNetworkError();

        const searchTerm = query.toLowerCase().trim();

        let filteredProducts = mockProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );

        // Apply additional filters
        if (options.category && options.category !== 'all') {
            filteredProducts = filteredProducts.filter(
                product => product.category === options.category
            );
        }

        if (typeof options.inStock === 'boolean') {
            filteredProducts = filteredProducts.filter(
                product => product.inStock === options.inStock
            );
        }

        return {
            success: true,
            data: filteredProducts,
            total: filteredProducts.length,
            message: `Found ${filteredProducts.length} results for "${query}"`
        };
    } catch (error) {
        return {
            success: false,
            data: [],
            total: 0,
            message: error.message || 'Failed to search products'
        };
    }
};

/**
 * Add a new product (simulate POST request)
 * @param {Object} productData - New product data
 * @returns {Promise<Object>} Promise resolving to creation result
 */
export const createProduct = async (productData) => {
    try {
        await simulateNetworkDelay();
        simulateNetworkError();

        // Generate new ID
        const newId = Math.max(...mockProducts.map(p => p.id)) + 1;

        const newProduct = {
            id: newId,
            ...productData,
            // Set defaults if not provided
            inStock: productData.inStock ?? true,
            featured: productData.featured ?? false,
            image: productData.image || "https://placehold.co/300x300"
        };

        // In a real app, this would save to database
        mockProducts.push(newProduct);

        return {
            success: true,
            data: newProduct,
            message: 'Product created successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.message || 'Failed to create product'
        };
    }
};

/**
 * Update an existing product (simulate PUT request)
 * @param {number} id - Product ID to update
 * @param {Object} updates - Updated product data
 * @returns {Promise<Object>} Promise resolving to update result
 */
export const updateProduct = async (id, updates) => {
    try {
        await simulateNetworkDelay();
        simulateNetworkError();

        const productIndex = mockProducts.findIndex(item => item.id === parseInt(id));

        if (productIndex === -1) {
            throw new Error(`Product with ID ${id} not found`);
        }

        // Update the product
        mockProducts[productIndex] = {
            ...mockProducts[productIndex],
            ...updates,
            id: parseInt(id) // Ensure ID doesn't change
        };

        return {
            success: true,
            data: mockProducts[productIndex],
            message: 'Product updated successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.message || 'Failed to update product'
        };
    }
};

/**
 * Delete a product (simulate DELETE request)
 * @param {number} id - Product ID to delete
 * @returns {Promise<Object>} Promise resolving to deletion result
 */
export const deleteProduct = async (id) => {
    try {
        await simulateNetworkDelay();
        simulateNetworkError();

        const productIndex = mockProducts.findIndex(item => item.id === parseInt(id));

        if (productIndex === -1) {
            throw new Error(`Product with ID ${id} not found`);
        }

        // Remove the product
        const deletedProduct = mockProducts.splice(productIndex, 1)[0];

        return {
            success: true,
            data: deletedProduct,
            message: 'Product deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.message || 'Failed to delete product'
        };
    }
};
