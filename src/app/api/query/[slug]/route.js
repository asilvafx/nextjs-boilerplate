// app/api/query/[slug]/route.js
import { NextResponse } from 'next/server';
import DBService from '@/data/rest.db.js';
import { withAuth, withAdminAuth } from '@/lib/auth.js';

// Helper function to get request body safely
async function getRequestBody(request) {
    try {
        const contentType = request.headers.get('content-type');
        if (contentType?.includes('multipart/form-data')) {
            return await request.formData();
        }
        return await request.json();
    } catch (error) {
        return null;
    }
}

// GET all items or single item - accessible to all authenticated users
async function handleGet(request, { params }) {
    try {
        const { slug } = await params;
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const key = url.searchParams.get('key');
        const value = url.searchParams.get('value');

        if (!slug) {
            return NextResponse.json(
                { error: 'Collection name is required' },
                { status: 400 }
            );
        }

        let result;

        // Get single item by ID
        if (id) {
            result = await DBService.read(id, slug);
            if (!result) {
                return NextResponse.json(
                    { error: 'Record not found' },
                    { status: 404 }
                );
            }
        }
        // Get items by key-value pair
        else if (key && value) {
            result = await DBService.getItemsByKeyValue(key, value, slug);
            if (!result) {
                return NextResponse.json(
                    { error: 'No records found' },
                    { status: 404 }
                );
            }
        }
        // Get all items
        else {
            result = await DBService.readAll(slug);
            if (!result) {
                return NextResponse.json(
                    { error: 'Data not found' },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get data error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve data.' },
            { status: 500 }
        );
    }
}

// POST create new item - accessible to all authenticated users
async function handlePost(request, { params }) {
    try {
        const { slug } = await params;
        const data = await getRequestBody(request);

        if (!slug) {
            return NextResponse.json(
                { error: 'Collection name is required' },
                { status: 400 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: 'Request body is required' },
                { status: 400 }
            );
        }

        // Add metadata
        const createData = {
            ...data,
            createdAt: new Date().toISOString(),
            createdBy: request.user.id,
            updatedAt: new Date().toISOString(),
            updatedBy: request.user.id
        };

        const newItem = await DBService.create(createData, slug);

        if (!newItem) {
            return NextResponse.json(
                { error: 'Failed to create record.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: newItem,
            message: 'Record created successfully!'
        }, { status: 201 });

    } catch (error) {
        console.error('Create data error:', error);
        return NextResponse.json(
            { error: 'Failed to create record.' },
            { status: 500 }
        );
    }
}

// PUT update item - admin only (or you can change to withAuth for all users)
async function handlePut(request, { params }) {
    try {
        const { slug } = await params;
        const data = await getRequestBody(request);

        if (!slug) {
            return NextResponse.json(
                { error: 'Collection name is required' },
                { status: 400 }
            );
        }

        if (!data || !data.id) {
            return NextResponse.json(
                { error: 'Request body with id is required' },
                { status: 400 }
            );
        }

        // Check if item exists
        const existingItem = await DBService.read(data.id, slug);
        if (!existingItem) {
            return NextResponse.json(
                { error: 'Record not found' },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData = {
            ...existingItem,
            ...data,
            updatedAt: new Date().toISOString(),
            updatedBy: request.user.id
        };

        const updatedItem = await DBService.update(data.id, updateData, slug);

        if (!updatedItem) {
            return NextResponse.json(
                { error: 'Failed to update record.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedItem,
            message: 'Record updated successfully!'
        });

    } catch (error) {
        console.error('Update data error:', error);
        return NextResponse.json(
            { error: 'Failed to update record.' },
            { status: 500 }
        );
    }
}

// DELETE item - admin only
async function handleDelete(request, { params }) {
    try {
        const { slug } = await params;
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!slug) {
            return NextResponse.json(
                { error: 'Collection name is required' },
                { status: 400 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { error: 'Record ID is required' },
                { status: 400 }
            );
        }

        // Check if item exists
        const existingItem = await DBService.read(id, slug);
        if (!existingItem) {
            return NextResponse.json(
                { error: 'Record not found' },
                { status: 404 }
            );
        }

        const deleted = await DBService.delete(id, slug);

        if (!deleted) {
            return NextResponse.json(
                { error: 'Failed to delete record.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Record deleted successfully!',
            data: { id }
        });

    } catch (error) {
        console.error('Delete record error:', error);
        return NextResponse.json(
            { error: 'Failed to delete record.' },
            { status: 500 }
        );
    }
}

// Export handlers with appropriate middleware
export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
export const PUT = withAdminAuth(handlePut); // Change to withAuth if you want all users to update
export const DELETE = withAdminAuth(handleDelete);
