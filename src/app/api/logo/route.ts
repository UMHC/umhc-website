import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename parameter required' }, { status: 400 });
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '');
    
    if (!sanitizedFilename.match(/\.(png|jpg|jpeg|svg|gif|webp)$/i)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const logoPath = join(process.cwd(), 'public', 'logos', sanitizedFilename);
    
    try {
      const fileBuffer = readFileSync(logoPath);
      
      // Determine content type based on file extension
      const extension = sanitizedFilename.split('.').pop()?.toLowerCase();
      let contentType = 'image/png'; // default
      
      switch (extension) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'svg':
          contentType = 'image/svg+xml';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
      }

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
          'Access-Control-Allow-Origin': '*', // Allow cross-origin requests for emails
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } catch {
      return NextResponse.json({ error: 'Logo file not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Logo API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}