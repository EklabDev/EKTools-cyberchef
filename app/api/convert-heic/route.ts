import { NextRequest, NextResponse } from 'next/server';
import heicConvert from 'heic-convert';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const format = formData.get('format') as string || 'JPEG'; // JPEG or PNG

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // heic-convert expects 'JPEG' | 'PNG'
    const targetFormat = format.toUpperCase() === 'PNG' ? 'PNG' : 'JPEG';

    const outputBuffer = await heicConvert({
      buffer: buffer,
      format: targetFormat,
      quality: 1
    });

    const contentType = targetFormat === 'PNG' ? 'image/png' : 'image/jpeg';
    const extension = targetFormat === 'PNG' ? 'png' : 'jpg';
    
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="converted.${extension}"`
      }
    });

  } catch (error: any) {
    console.error('Conversion error:', error);
    return NextResponse.json({ error: error.message || 'Conversion failed' }, { status: 500 });
  }
}

