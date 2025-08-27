// lib/shop.js
"use client"
import {useState} from 'react';
import { authenticatedFetch } from '@/utils/authUtils.js';

export class ShopAPI {

    // Get all items with optional filters
    static async getAllItems(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `/api/shop/items${queryString ? `?${queryString}` : ''}`;

        try {
            const response = await authenticatedFetch(url);
            if (!response) return null;

            return await response.json();
        } catch (error) {
            console.error('Get all items error:', error);
            throw error;
        }
    }

    // Get single item by ID
    static async getItem(id) {
        try {
            const response = await authenticatedFetch(`/api/shop/items/${id}`);
            if (!response) return null;

            return await response.json();
        } catch (error) {
            console.error('Get item error:', error);
            throw error;
        }
    }

    // Create new item (admin only)
    static async createItem(itemData) {
        try {
            const response = await authenticatedFetch('/api/shop/items', {
                method: 'POST',
                body: JSON.stringify(itemData)
            });
            if (!response) return null;

            return await response.json();
        } catch (error) {
            console.error('Create item error:', error);
            throw error;
        }
    }

    // Update item (admin only)
    static async updateItem(id, itemData) {
        try {
            const response = await authenticatedFetch(`/api/shop/items/${id}`, {
                method: 'PUT',
                body: JSON.stringify(itemData)
            });
            if (!response) return null;

            return await response.json();
        } catch (error) {
            console.error('Update item error:', error);
            throw error;
        }
    }

    // Delete item (admin only)
    static async deleteItem(id) {
        try {
            const response = await authenticatedFetch(`/api/shop/items/${id}`, {
                method: 'DELETE'
            });
            if (!response) return null;

            return await response.json();
        } catch (error) {
            console.error('Delete item error:', error);
            throw error;
        }
    }

    // Get all categories
    static async getCategories() {
        try {
            const response = await authenticatedFetch('/api/shop/categories');
            if (!response) return null;

            return await response.json();
        } catch (error) {
            console.error('Get categories error:', error);
            throw error;
        }
    }

    // Search items
    static async searchItems(searchTerm, filters = {}) {
        const params = {
            search: searchTerm,
            ...filters
        };

        return this.getAllItems(params);
    }

    // Get items by category
    static async getItemsByCategory(category, params = {}) {
        const filterParams = {
            category,
            ...params
        };

        return this.getAllItems(filterParams);
    }

// Advanced search
static async advancedSearch(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/shop/search${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await authenticatedFetch(url);
        if (!response) return null;

        return await response.json();
    } catch (error) {
        console.error('Advanced search error:', error);
        throw error;
    }
}

// Get shop statistics (admin only)
static async getStats() {
    try {
        const response = await authenticatedFetch('/api/shop/stats');
        if (!response) return null;

        return await response.json();
    } catch (error) {
        console.error('Get stats error:', error);
        throw error;
    }
}

// Bulk operations (admin only)
static async bulkOperation(operation, itemIds, data = null) {
    try {
        const response = await authenticatedFetch('/api/shop/bulk', {
            method: 'POST',
            body: JSON.stringify({
                operation,
                itemIds,
                data
            })
        });
        if (!response) return null;

        return await response.json();
    } catch (error) {
        console.error('Bulk operation error:', error);
        throw error;
    }
}
}

// React hooks for shop operations
export const useShopAPI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (apiCall) => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiCall();
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message || 'An error occurred');
            setLoading(false);
            throw err;
        }
    };

    return {
        loading,
        error,
        execute,
        // Basic methods
        getAllItems: (params) => execute(() => ShopAPI.getAllItems(params)),
        getItem: (id) => execute(() => ShopAPI.getItem(id)),
        createItem: (data) => execute(() => ShopAPI.createItem(data)),
        updateItem: (id, data) => execute(() => ShopAPI.updateItem(id, data)),
        deleteItem: (id) => execute(() => ShopAPI.deleteItem(id)),
        getCategories: () => execute(() => ShopAPI.getCategories()),
        searchItems: (term, filters) => execute(() => ShopAPI.searchItems(term, filters)),
        // Advanced methods
        advancedSearch: (params) => execute(() => ShopAPI.advancedSearch(params)),
        getStats: () => execute(() => ShopAPI.getStats()),
        bulkOperation: (operation, itemIds, data) => execute(() => ShopAPI.bulkOperation(operation, itemIds, data))
    };
};
