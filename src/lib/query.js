// lib/query.js - Query Helper Library

import { authenticatedFetch, publicFetch } from '@/hooks/useAuth.js';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

// Helper function to convert object data to array format
export const convertToArray = (data, includeKey = true) => {
    if (!data || typeof data !== 'object') return [];

    return Object.entries(data).map(([key, item]) => ({
        ...item,
        // Add the key as a property if it doesn't exist
        key: key,
        // Use key as id if no id exists
        id: item.id || key
    }));
};

class QueryAPI {
    constructor() {
        this.baseURL = `${API_BASE_URL}/api/query`;
        this.uploadURL = `${API_BASE_URL}/api/upload`;
    }

    // Helper method for making API calls
    async makeRequest(url, options = {}) {
        try {
            let fetch;
            if(options.public){
                fetch = await publicFetch(url, options);
            } else {
                fetch = await authenticatedFetch(url, options);
            }
            const response = fetch;

            if (!response) {
                throw new Error('No response received');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // GET all items from a collection
    async getAllItems(collection, arrayOpt=false, isPublic=false) {
        const url = `${this.baseURL}/${collection}`;
        const result = await this.makeRequest(url, {public: isPublic});
        const dataObj = result.data;
        if(arrayOpt){
            return convertToArray(dataObj);
        }
        return dataObj;
    }

    // GET single item by ID
    async getItem(collection, id) {
        const url = `${this.baseURL}/${collection}?id=${encodeURIComponent(id)}`;
        const result = await this.makeRequest(url);
        return result.data;
    }

    // GET single item by ID
    async getItemByKey(collection, key, value) {
        const url = `${this.baseURL}/${collection}?key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`;
        const result = await this.makeRequest(url);
        return result.data;
    }


    // POST create new item
    async createItem(collection, data) {
        const url = `${this.baseURL}/${collection}`;
        const options = {
            method: 'POST',
            body: JSON.stringify(data)
        };
        const result = await this.makeRequest(url, options);
        return result.data;
    }

    // PUT update item
    async updateItem(collection, id, data) {
        const url = `${this.baseURL}/${collection}`;
        const updateData = { ...data, id };
        const options = {
            method: 'PUT',
            body: JSON.stringify(updateData)
        };
        const result = await this.makeRequest(url, options);
        return result.data;
    }

    // DELETE item
    async deleteItem(collection, id) {
        const url = `${this.baseURL}/${collection}?id=${encodeURIComponent(id)}`;
        const options = {
            method: 'DELETE'
        };
        const result = await this.makeRequest(url, options);
        return result.data;
    }

    // UPLOAD file
    async uploadFile(file, path = 'uploads') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', path);

        const options = {
            method: 'POST',
            body: formData,
            headers: {} // Remove Content-Type header to let browser set it for FormData
        };

        // Remove Content-Type from default headers for FormData
        const response = await authenticatedFetch(this.uploadURL, {
            ...options,
            headers: {
                // Don't set Content-Type for FormData
                ...Object.fromEntries(
                    Object.entries(options.headers || {}).filter(
                        ([key]) => key.toLowerCase() !== 'content-type'
                    )
                )
            }
        });

        if (!response) {
            throw new Error('No response received');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    }

    // Batch operations
    async batchCreate(collection, items) {
        const results = [];
        for (const item of items) {
            try {
                const result = await this.createItem(collection, item);
                results.push({ success: true, data: result });
            } catch (error) {
                results.push({ success: false, error: error.message, data: item });
            }
        }
        return results;
    }

    async batchUpdate(collection, updates) {
        const results = [];
        for (const update of updates) {
            try {
                const result = await this.updateItem(collection, update.id, update.data);
                results.push({ success: true, data: result, id: update.id });
            } catch (error) {
                results.push({ success: false, error: error.message, id: update.id });
            }
        }
        return results;
    }

    async batchDelete(collection, ids) {
        const results = [];
        for (const id of ids) {
            try {
                const result = await this.deleteItem(collection, id);
                results.push({ success: true, data: result, id });
            } catch (error) {
                results.push({ success: false, error: error.message, id });
            }
        }
        return results;
    }

    // Advanced queries (if your DBService supports them)
    async searchItems(collection, searchParams) {
        const queryString = new URLSearchParams(searchParams).toString();
        const url = `${this.baseURL}/${collection}?${queryString}`;
        const result = await this.makeRequest(url);
        return result.data;
    }

    // Helper methods for common use cases
    async getUserById(userId) {
        return await this.getItem('users', userId);
    }

    async getUsersByRole(role) {
        return await this.getItemByKey('users', 'role', role);
    }

    async getUsersByEmail(email) {
        return await this.getItemByKey('users', 'email', email);
    }

    async getCustomers(email) {
        return await this.getAllItems('orders');
    }

    async getAllUsers() {
        return await this.getAllItems('users');
    }

    async createUser(userData) {
        return await this.createItem('users', userData);
    }

    async updateUser(userId, userData) {
        return await this.updateItem('users', userId, userData);
    }

    async deleteUser(userId) {
        return await this.deleteItem('users', userId);
    }

    async getById(collection, id) {
        return await this.getItem(collection, id);
    }

    async getByField(collection, field, value) {
        return await this.getItemByKey(collection, field, value);
    }

    async create(collection, data) {
        return await this.createItem(collection, data);
    }

    async update(collection, id, data) {
        return await this.updateItem(collection, id, data);
    }

    async delete(collection, id) {
        return await this.deleteItem(collection, id);
    }

    async upload(file, path) {
        return await this.uploadFile(file, path);
    }
}

// Create and export a singleton instance
const queryAPI = new QueryAPI();

// Export individual functions for convenience
export const getItem = (collection, id) => queryAPI.getItem(collection, id);
export const getItemByKey = (collection, key, value) => queryAPI.getItemByKey(collection, key, value);
export const createItem = (collection, data) => queryAPI.createItem(collection, data);
export const updateItem = (collection, id, data) => queryAPI.updateItem(collection, id, data);
export const deleteItem = (collection, id) => queryAPI.deleteItem(collection, id);

// Export batch operations
export const batchCreate = (collection, items) => queryAPI.batchCreate(collection, items);
export const batchUpdate = (collection, updates) => queryAPI.batchUpdate(collection, updates);
export const batchDelete = (collection, ids) => queryAPI.batchDelete(collection, ids);

// Export user-specific helpers
export const getUserById = (userId) => queryAPI.getUserById(userId);
export const getUsersByRole = (role) => queryAPI.getUsersByRole(role);
export const getUsersByEmail = (email) => queryAPI.getUsersByEmail(email);
export const getAllUsers = () => queryAPI.getAllUsers();
export const createUser = (userData) => queryAPI.createUser(userData);
export const updateUser = (userId, userData) => queryAPI.updateUser(userId, userData);
export const deleteUser = (userId) => queryAPI.deleteUser(userId);

// Export generic helpers
export const getAll = (collection, arrayOpt, isPublic) => queryAPI.getAllItems(collection, arrayOpt, isPublic);
export const getById = (collection, id) => queryAPI.getById(collection, id);
export const getByField = (collection, field, value) => queryAPI.getByField(collection, field, value);
export const create = (collection, data) => queryAPI.create(collection, data);
export const update = (collection, id, data) => queryAPI.update(collection, id, data);
export const upload = (file, path) => queryAPI.upload(file, path);

// Export the main class instance
export default queryAPI;
