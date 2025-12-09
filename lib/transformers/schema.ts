import { jsonSchemaToZod } from 'json-schema-to-zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

export async function jsonSchemaToTypescript(schema: string, name: string = 'MySchema'): Promise<string> {
  // We use an API route because json-schema-to-typescript uses 'fs' and cannot run in the browser.
  try {
    const response = await fetch('/api/json-to-ts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema, name })
    });
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'Conversion failed');
    }
    return result.output;
  } catch (e: any) {
    throw new Error(`Failed to convert JSON Schema to TypeScript: ${e.message}`);
  }
}

export function jsonSchemaToZodSchema(schema: string, name: string = 'schema'): string {
  try {
    const jsonSchema = JSON.parse(schema);
    const zodCode = jsonSchemaToZod(jsonSchema, { name, module: 'none' });
    return zodCode;
  } catch (e: any) {
    throw new Error(`Failed to convert JSON Schema to Zod: ${e.message}`);
  }
}

export function zodCodeToJsonSchema(zodCode: string): string {
  try {
    // SECURITY WARNING: This evaluates arbitrary code. 
    // In a real production environment with untrusted users, this is dangerous.
    // For a local dev tool, it might be acceptable.
    // We assume the code evaluates to a Zod schema.
    
    // We need to construct a function that returns the schema.
    // We provide 'z' in the scope.
    const func = new Function('z', `return ${zodCode};`);
    const zodSchema = func(z);
    
    const jsonSchema = zodToJsonSchema(zodSchema, 'mySchema');
    return JSON.stringify(jsonSchema, null, 2);
  } catch (e: any) {
    throw new Error(`Failed to convert Zod code to JSON Schema: ${e.message}. Ensure code evaluates to a Zod schema (e.g. "z.string()")`);
  }
}
