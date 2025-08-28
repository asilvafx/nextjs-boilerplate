// app/api/shop/categories/route.js
import { NextResponse } from 'next/server';
import DBService from '@/data/rest.db.js';
import { withAuth, withAdminAuth } from '@/lib/auth.js';

// GET all categories - accessible to all authenticated users
async function getCategoriesHandler(request) {
    try {
        // Get all items to extract unique categories
        const response = await DBService.readAll("catalog");

        // Handle different response formats
        let items = [];
        if (Array.isArray(response)) {
            items = response;
        } else if (response && Array.isArray(response.data)) {
            items = response.data;
        } else if (response && response.success && Array.isArray(response.data)) {
            items = response.data;
        } else if (response && typeof response === 'object') {
            // Handle object format where keys are IDs and values are items
            items = Object.entries(response).map(([id, item]) => ({
                id,
                ...item
            }));
        } else if (response && response.data && typeof response.data === 'object') {
            // Handle wrapped object format
            items = Object.entries(response.data).map(([id, item]) => ({
                id,
                ...item
            }));
        }

        console.log('Categories - Items data structure:', {
            responseType: typeof response,
            isArray: Array.isArray(response?.data),
            itemsLength: items.length
        });

        if (!items || items.length === 0) {
            // Return default categories if no items exist
            const defaultCategories = [
                { id: 1, name: 'general', description: 'General items' },
                { id: 2, name: 'electronics', description: 'Electronic products' },
                { id: 3, name: 'clothing', description: 'Clothing and accessories' },
                { id: 4, name: 'services', description: 'Various services' },
                { id: 5, name: 'digital', description: 'Digital products' }
            ];

            return NextResponse.json({
                success: true,
                data: defaultCategories
            });
        }

        // Extract unique categories from existing items
        const categorySet = new Set();
        items.forEach(item => {
            if (item && item.category && item.category.trim()) {
                categorySet.add(item.category.toLowerCase().trim());
            }
        });

        // Convert to array with proper structure
        const categories = Array.from(categorySet).map((category, index) => ({
            id: index + 1,
            name: category,
            description: `${category.charAt(0).toUpperCase() + category.slice(1)} items`
        }));

        // Add default categories if they don't exist
        const defaultCats = ['general', 'electronics', 'clothing', 'services', 'digital'];
        defaultCats.forEach(defaultCat => {
            if (!categories.find(cat => cat.name === defaultCat)) {
                categories.push({
                    id: categories.length + 1,
                    name: defaultCat,
                    description: `${defaultCat.charAt(0).toUpperCase() + defaultCat.slice(1)} items`
                });
            }
        });

        // Sort categories alphabetically
        categories.sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve categories.' },
            { status: 500 }
        );
    }
}

// POST new category - admin only
async function addCategoryHandler(request) {
    try {
        const data = await request.json();

        // Validation
        if (!data.name || !data.name.trim()) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        // For now, we'll just return success since categories are derived from items
        // In a more complex system, you might want to store categories separately
        const categoryData = {
            name: data.name.trim().toLowerCase(),
            description: data.description?.trim() || `${data.name.trim()} items`,
            createdAt: new Date().toISOString(),
            createdBy: request.user.id
        };

        return NextResponse.json({
            success: true,
            data: categoryData,
            message: 'Category noted. It will appear when items are added to this category.'
        }, { status: 201 });

    } catch (error) {
        console.error('Add category error:', error);
        return NextResponse.json(
            { error: 'Failed to create category.' },
            { status: 500 }
        );
    }
}

// Export handlers with appropriate middleware
export const GET = withAuth(getCategoriesHandler);
export const POST = withAdminAuth(addCategoryHandler);
