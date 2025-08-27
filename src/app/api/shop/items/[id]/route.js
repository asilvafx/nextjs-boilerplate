// app/api/shop/items/[id]/route.js
import { NextResponse } from 'next/server';
import DBService from '@/data/rest.db.js';
import { withAuth, withAdminAuth } from '@/lib/auth.js';

// GET single item - accessible to all authenticated users
async function getSingleItemHandler(request, { params }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: 'Item ID is required.' },
                { status: 400 }
            );
        }

        // Get item from database
        const item = await DBService.readBy("id", id, "shop_items");

        if (!item) {
            return NextResponse.json(
                { error: 'Item not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: item
        });

    } catch (error) {
        console.error('Get single item error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve item.' },
            { status: 500 }
        );
    }
}

// PUT/PATCH update item - admin only
async function updateItemHandler(request, { params }) {
    try {
        const { id } = params;
        const data = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Item ID is required.' },
                { status: 400 }
            );
        }

        // Check if item exists
        const existingItem = await DBService.readBy("id", id, "shop_items");
        if (!existingItem) {
            return NextResponse.json(
                { error: 'Item not found.' },
                { status: 404 }
            );
        }

        // Validate price if provided
        if (data.price !== undefined && (isNaN(data.price) || data.price < 0)) {
            return NextResponse.json(
                { error: 'Price must be a valid positive number.' },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData = {
            ...existingItem,
            ...Object.fromEntries(
                Object.entries(data).filter(([_, value]) => value !== undefined)
            ),
            updatedAt: new Date().toISOString(),
            updatedBy: request.user.id
        };

        // Clean up data
        if (updateData.name) updateData.name = updateData.name.trim();
        if (updateData.description) updateData.description = updateData.description.trim();
        if (updateData.category) updateData.category = updateData.category.trim();
        if (updateData.image) updateData.image = updateData.image.trim();
        if (updateData.price) updateData.price = parseFloat(updateData.price);

        // Update in database
        const updatedItem = await DBService.update(id, updateData, "shop_items");

        if (!updatedItem) {
            return NextResponse.json(
                { error: 'Failed to update item.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedItem,
            message: 'Item updated successfully!'
        });

    } catch (error) {
        console.error('Update item error:', error);
        return NextResponse.json(
            { error: 'Failed to update item.' },
            { status: 500 }
        );
    }
}

// DELETE item - admin only
async function deleteItemHandler(request, { params }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: 'Item ID is required.' },
                { status: 400 }
            );
        }

        // Check if item exists
        const existingItem = await DBService.readBy("id", id, "shop_items");
        if (!existingItem) {
            return NextResponse.json(
                { error: 'Item not found.' },
                { status: 404 }
            );
        }

        // Delete from database
        const deleted = await DBService.delete(id, "shop_items");

        if (!deleted) {
            return NextResponse.json(
                { error: 'Failed to delete item.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Item deleted successfully!',
            deletedItem: existingItem
        });

    } catch (error) {
        console.error('Delete item error:', error);
        return NextResponse.json(
            { error: 'Failed to delete item.' },
            { status: 500 }
        );
    }
}

// Export handlers with appropriate middleware
export const GET = withAuth(getSingleItemHandler);
export const PUT = withAdminAuth(updateItemHandler);
export const PATCH = withAdminAuth(updateItemHandler);
export const DELETE = withAdminAuth(deleteItemHandler);
