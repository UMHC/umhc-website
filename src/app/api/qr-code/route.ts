import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
// import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data');
    const size = parseInt(searchParams.get('size') || '300');

    if (!data) {
      return NextResponse.json(
        { error: 'Data parameter is required' },
        { status: 400 }
      );
    }

    // Create canvas for QR code
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Generate QR code as data URL
    const qrDataURL = await QRCode.toDataURL(data, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M' // Medium error correction for reliable scanning
    });

    // Load QR code image
    const qrImage = await loadImage(qrDataURL);
    ctx.drawImage(qrImage, 0, 0, size, size);

    // Convert canvas to PNG buffer
    const buffer = canvas.toBuffer('image/png');

    // Return the image
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}