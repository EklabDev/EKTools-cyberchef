import { NextRequest, NextResponse } from 'next/server';
import { compile } from 'json-schema-to-typescript';

export async function POST(req: NextRequest) {
  try {
    const { schema, name } = await req.json();
    
    if (!schema) {
      return NextResponse.json({ error: 'Schema is required' }, { status: 400 });
    }

    const jsonSchema = typeof schema === 'string' ? JSON.parse(schema) : schema;
    const ts = await compile(jsonSchema, name || 'MySchema');

    return NextResponse.json({ output: ts });
  } catch (error: any) {
    console.error('Schema conversion error:', error);
    return NextResponse.json({ error: error.message || 'Conversion failed' }, { status: 500 });
  }
}

