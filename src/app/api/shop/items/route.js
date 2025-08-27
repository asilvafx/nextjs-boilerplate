// app/api/shop/items/route.js
import { NextResponse } from 'next/server';
import DBService from '@/data/rest.db.js';
import { withAuth, withAdminAuth } from '@/lib/auth.js';

// GET all items - accessible to all authenticated users
async function getAllItemsHandler(request) {
    try {
        const { searchParams } = new URL(request.url);

        // Optional query parameters
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        // Get all items from database
        let items = await DBService.readAll("shop_items");

        if (!items) {
            items = [];
        }

        // Filter by category if provided
        if (category) {
            items = items.filter(item =>
                item.category && item.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Search functionality
        if (search) {
            const searchTerm = search.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm))
            );
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = items.slice(startIndex, endIndex);

        return NextResponse.json({
            success: true,
            data: paginatedItems,
            pagination: {
                currentPage: page,
                totalItems: items.length,
                totalPages: Math.ceil(items.length / limit),
                hasNext: endIndex < items.length,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get all items error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve items.' },
            { status: 500 }
        );
    }
}

// POST new item - admin only
async function addItemHandler(request) {
    try {
        const data = await request.json();

        // Validation
        const requiredFields = ['name', 'price'];
        const missingFields = requiredFields.filter(field => !data[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate price is a positive number
        if (isNaN(data.price) || data.price < 0) {
            return NextResponse.json(
                { error: 'Price must be a valid positive number.' },
                { status: 400 }
            );
        }

        // Prepare item data
        const itemData = {
            name: data.name.trim(),
            description: data.description?.trim() || '',
            price: parseFloat(data.price),
            category: data.category?.trim() || 'general',
            image: data.image?.trim() || '',
            stock: data.stock || 0,
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: new Date().toISOString(),
            createdBy: request.user.id
        };

        // Save to database
        const newItem = await DBService.create(itemData, "shop_items");

        if (!newItem) {
            return NextResponse.json(
                { error: 'Failed to create item.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: newItem,
            message: 'Item created successfully!'
        }, { status: 201 });

    } catch (error) {
        console.error('Add item error:', error);
        return NextResponse.json(
            { error: 'Failed to create item.' },
            { status: 500 }
        );
    }
}

// Export handlers with appropriate middleware
export const GET = withAuth(getAllItemsHandler);
export const POST = withAdminAuth(addItemHandler);
