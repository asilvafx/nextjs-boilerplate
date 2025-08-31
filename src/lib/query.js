// lib/query.js - Minimized Query Helper Library

import { authenticatedFetch, publicFetch } from '@/hooks/useAuth.js';

class QueryAPI {
    constructor() {
        this.baseURL = `/api/query`;
        this.uploadURL = `/api/upload`;
    }

    // Helper method for making API calls
    async makeRequest(url, options = {}) {
        try {
            let response;
            if (options.public) {
                response = await publicFetch(url, options);
            } else {
                response = await authenticatedFetch(url, options);
            }

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
    async getAll(collection, params={}, isPublic = false) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.baseURL}/${collection}${queryString ? `?${queryString}` : ''}`;
        return await this.makeRequest(url, { public: isPublic });
    }

    // GET single item by ID
    async get(collection, id) {
        const url = `${this.baseURL}/${collection}?id=${encodeURIComponent(id)}`;
        const result = await this.makeRequest(url);
        return result.data;
    }

    // POST create new item
    async create(collection, data) {
        const url = `${this.baseURL}/${collection}`;
        const options = {
            method: 'POST',
            body: JSON.stringify(data)
        };
        const result = await this.makeRequest(url, options);
        return result.data;
    }

    // PUT update item
    async update(collection, id, data) {
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
    async delete(collection, id) {
        const url = `${this.baseURL}/${collection}?id=${encodeURIComponent(id)}`;
        const options = {
            method: 'DELETE'
        };
        const result = await this.makeRequest(url, options);
        return result.data;
    }

    // UPLOAD file
    async upload(files, path = 'uploads') {
        const formData = new FormData();

        // Handle single file or multiple files
        if (Array.isArray(files)) {
            files.forEach(file => formData.append('files', file));
        } else {
            formData.append('files', files);
        }

        const options = {
            method: 'POST',
            body: formData
        };

        const response = await authenticatedFetch(this.uploadURL, options);

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

    // Batch create
    async batchCreate(collection, items) {
        const results = [];
        for (const item of items) {
            try {
                const result = await this.create(collection, item);
                results.push({ success: true, data: result });
            } catch (error) {
                results.push({ success: false, error: error.message, data: item });
            }
        }
        return results;
    }

    // Batch update
    async batchUpdate(collection, updates) {
        const results = [];
        for (const update of updates) {
            try {
                const result = await this.update(collection, update.id, update.data);
                results.push({ success: true, data: result, id: update.id });
            } catch (error) {
                results.push({ success: false, error: error.message, id: update.id });
            }
        }
        return results;
    }

    // Batch delete
    async batchDelete(collection, ids) {
        const results = [];
        for (const id of ids) {
            try {
                const result = await this.delete(collection, id);
                results.push({ success: true, data: result, id });
            } catch (error) {
                results.push({ success: false, error: error.message, id });
            }
        }
        return results;
    }
}

// Create and export a singleton instance
const queryAPI = new QueryAPI();

// Export individual functions
export const get = (collection, id) => queryAPI.get(collection, id);
export const getAll = (collection, isPublic = false) => queryAPI.getAll(collection, isPublic);
export const create = (collection, data) => queryAPI.create(collection, data);
export const update = (collection, id, data) => queryAPI.update(collection, id, data);
export const deleteItem = (collection, id) => queryAPI.delete(collection, id);
export const upload = (files, path) => queryAPI.upload(files, path);

// Export batch operations
export const batchCreate = (collection, items) => queryAPI.batchCreate(collection, items);
export const batchUpdate = (collection, updates) => queryAPI.batchUpdate(collection, updates);
export const batchDelete = (collection, ids) => queryAPI.batchDelete(collection, ids);

// Export the main class instance
export default queryAPI;
