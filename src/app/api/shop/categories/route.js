// app/api/shop/categories/route.js
import { NextResponse } from 'next/server';
import DBService from '@/data/rest.db.js';
import { withAuth } from '@/lib/auth.js';

// GET all categories - accessible to all authenticated users
async function getCategoriesHandler(request) {
    try {
        // Get all items to extract categories
        const items = await DBService.readAll("shop_items");

        if (!items || items.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                message: 'No categories found.'
            });
        }

        // Extract unique categories
        const categories = [...new Set(
            items
                .filter(item => item.category && item.category.trim())
                .map(item => item.category.trim())
        )];

        // Get category counts
        const categoryData = categories.map(category => ({
            name: category,
            count: items.filter(item => item.category === category).length,
            activeCount: items.filter(item =>
                item.category === category && item.isActive !== false
            ).length
        }));

        // Sort by count (descending)
        categoryData.sort((a, b) => b.count - a.count);

        return NextResponse.json({
            success: true,
            data: categoryData,
            totalCategories: categories.length
        });

    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve categories.' },
            { status: 500 }
        );
    }
}

export const GET = withAuth(getCategoriesHandler);
