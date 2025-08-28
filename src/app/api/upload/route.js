// app/api/upload/route.js
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { withAuth } from '@/lib/auth.js';

// POST handler for file uploads
async function uploadHandler(request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files');

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (error) {
            // Directory might already exist, that's okay
        }

        const uploadedFiles = [];
        const maxFileSize = 5 * 1024 * 1024; // 5MB limit

        for (const file of files) {
            // Validation
            if (!file.name) {
                continue; // Skip empty files
            }

            if (file.size > maxFileSize) {
                return NextResponse.json(
                    { error: `File ${file.name} is too large. Maximum size is 5MB.` },
                    { status: 400 }
                );
            }

            // Generate unique filename
            const fileExtension = file.name.split('.').pop();
            const uniqueFilename = `${uuidv4()}.${fileExtension}`;
            const filePath = join(uploadsDir, uniqueFilename);

            // Convert file to buffer and save
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filePath, buffer);

            // Create public URL
            const publicUrl = `/uploads/${uniqueFilename}`;

            uploadedFiles.push({
                id: uuidv4(),
                filename: uniqueFilename,
                originalName: file.name,
                url: publicUrl,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
            });
        }

        return NextResponse.json({
            success: true,
            data: uploadedFiles,
            message: `${uploadedFiles.length} file(s) uploaded successfully`
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload files' },
            { status: 500 }
        );
    }
}

// Export with authentication
export const POST = withAuth(uploadHandler);
