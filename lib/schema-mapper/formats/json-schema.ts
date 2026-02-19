import { FormatHandler, JsonSchemaDefinition } from '../types';

export const jsonSchemaHandler: FormatHandler = {
  parse: async (input: string): Promise<JsonSchemaDefinition> => {
    const parsed = JSON.parse(input);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Input must be a JSON object');
    }
    if (!parsed.type && !parsed.properties && !parsed.$ref && !parsed.oneOf && !parsed.anyOf && !parsed.allOf) {
      throw new Error('Input does not appear to be a valid JSON Schema (missing type, properties, or combinators)');
    }
    return parsed as JsonSchemaDefinition;
  },

  generate: async (schema: JsonSchemaDefinition): Promise<string> => {
    return JSON.stringify(schema, null, 2);
  },

  validate: (input: string) => {
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed !== 'object' || parsed === null) {
        return { valid: false, error: 'Input must be a JSON object' };
      }
      if (!parsed.type && !parsed.properties && !parsed.$ref && !parsed.oneOf && !parsed.anyOf && !parsed.allOf) {
        return { valid: false, error: 'Missing type, properties, or combinators — not a valid JSON Schema' };
      }
      return { valid: true };
    } catch (e: any) {
      return { valid: false, error: `Invalid JSON: ${e.message}` };
    }
  },
};
