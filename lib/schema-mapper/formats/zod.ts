import { jsonSchemaToZod } from 'json-schema-to-zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { FormatHandler, JsonSchemaDefinition } from '../types';

export const zodHandler: FormatHandler = {
  parse: async (input: string): Promise<JsonSchemaDefinition> => {
    const func = new Function('z', `return ${input};`);
    const zodSchema = func(z);
    const result = zodToJsonSchema(zodSchema, 'mySchema');
    const definitions = (result as any).definitions ?? (result as any).$defs;
    if (definitions?.mySchema) {
      return definitions.mySchema as JsonSchemaDefinition;
    }
    const { $schema, definitions: _d, $defs: _dd, ...rest } = result as any;
    return rest as JsonSchemaDefinition;
  },

  generate: async (schema: JsonSchemaDefinition): Promise<string> => {
    return jsonSchemaToZod(schema, { module: 'none' });
  },

  validate: (input: string) => {
    try {
      const func = new Function('z', `return ${input};`);
      const result = func(z);
      if (!result || typeof result !== 'object' || !('_zod' in result || '_def' in result)) {
        return { valid: false, error: 'Expression does not evaluate to a Zod schema' };
      }
      return { valid: true };
    } catch (e: any) {
      return { valid: false, error: `Invalid Zod expression: ${e.message}` };
    }
  },
};
