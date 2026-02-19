import { FormatHandler, JsonSchemaDefinition } from '../types';

const MODEL_OR_ENUM_REGEX = /(?:model|enum)\s+\w+\s*\{/;

export const prismaHandler: FormatHandler = {
  parse: async (input: string): Promise<JsonSchemaDefinition> => {
    const models = extractModelBlocks(input);
    const enums = extractEnumBlocks(input);
    if (models.length === 0 && enums.length === 0) {
      throw new Error('No Prisma model or enum definitions found');
    }

    const enumDefs: Record<string, string[]> = {};
    for (const e of enums) {
      enumDefs[e.name] = e.values;
    }

    if (models.length === 1 && enums.length === 0) {
      const schema = parseModelBody(models[0].body, enumDefs);
      schema.title = models[0].name;
      return schema;
    }

    const definitions: Record<string, JsonSchemaDefinition> = {};
    for (const e of enums) {
      definitions[e.name] = { type: 'string', enum: e.values };
    }
    for (const model of models) {
      definitions[model.name] = parseModelBody(model.body, enumDefs);
    }
    return { type: 'object', definitions, properties: {}, title: 'Root' };
  },

  generate: async (schema: JsonSchemaDefinition): Promise<string> => {
    const parts: string[] = [];

    if (schema.definitions || schema.$defs) {
      const defs = schema.definitions ?? schema.$defs ?? {};
      for (const [name, def] of Object.entries(defs)) {
        if (def.enum && def.type === 'string') {
          parts.push(generateEnum(name, def.enum as string[]));
        } else {
          parts.push(generateModel(name, def));
        }
        parts.push('');
      }
      if (schema.properties && Object.keys(schema.properties).length > 0) {
        parts.push(generateModel(schema.title ?? 'Root', schema));
      }
    } else {
      parts.push(generateModel(schema.title ?? 'MyModel', schema));
    }

    return parts.join('\n').trim();
  },

  validate: (input: string) => {
    if (!input.trim()) return { valid: false, error: 'Empty input' };
    if (!MODEL_OR_ENUM_REGEX.test(input)) {
      return { valid: false, error: 'No Prisma model or enum definition found' };
    }
    try {
      const models = extractModelBlocks(input);
      const enums = extractEnumBlocks(input);
      if (models.length === 0 && enums.length === 0) {
        return { valid: false, error: 'Could not parse any model or enum blocks' };
      }
      return { valid: true };
    } catch (e: any) {
      return { valid: false, error: e.message };
    }
  },
};

function extractModelBlocks(input: string): { name: string; body: string }[] {
  return extractBlocks(input, /model\s+(\w+)\s*\{/g);
}

function extractEnumBlocks(input: string): { name: string; values: string[] }[] {
  const raw = extractBlocks(input, /enum\s+(\w+)\s*\{/g);
  return raw.map(block => ({
    name: block.name,
    values: block.body
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//')),
  }));
}

function extractBlocks(input: string, regex: RegExp): { name: string; body: string }[] {
  const blocks: { name: string; body: string }[] = [];
  let match;
  while ((match = regex.exec(input)) !== null) {
    const name = match[1];
    const startIdx = match.index + match[0].length;
    let depth = 1;
    let i = startIdx;
    while (i < input.length && depth > 0) {
      if (input[i] === '{') depth++;
      else if (input[i] === '}') depth--;
      i++;
    }
    if (depth === 0) {
      blocks.push({ name, body: input.slice(startIdx, i - 1) });
    }
  }
  return blocks;
}

function parseModelBody(body: string, enumDefs: Record<string, string[]>): JsonSchemaDefinition {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('@@'));

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;

    const [name, rawType] = parts;
    if (name.startsWith('@')) continue;

    const isOptional = rawType.endsWith('?');
    const isArray = rawType.endsWith('[]');
    const baseType = rawType.replace(/[?\[\]]/g, '');

    let jsonSchema = prismaTypeToJsonSchema(baseType, enumDefs);
    if (isArray) {
      jsonSchema = { type: 'array', items: jsonSchema };
    }
    if (isOptional) {
      const t = jsonSchema.type ?? 'string';
      jsonSchema = { ...jsonSchema, type: [t, 'null'] };
    }

    properties[name] = jsonSchema;
    if (!isOptional) required.push(name);
  }

  const schema: JsonSchemaDefinition = { type: 'object', properties };
  if (required.length > 0) schema.required = required;
  return schema;
}

function prismaTypeToJsonSchema(prismaType: string, enumDefs: Record<string, string[]>): any {
  if (enumDefs[prismaType]) {
    return { type: 'string', enum: enumDefs[prismaType] };
  }
  switch (prismaType) {
    case 'String': return { type: 'string' };
    case 'Int': case 'BigInt': return { type: 'integer' };
    case 'Float': case 'Decimal': return { type: 'number' };
    case 'Boolean': return { type: 'boolean' };
    case 'DateTime': return { type: 'string', format: 'date-time' };
    case 'Json': return { type: 'object', additionalProperties: true };
    case 'Bytes': return { type: 'string' };
    default: return { type: 'string' };
  }
}

function generateModel(name: string, schema: JsonSchemaDefinition): string {
  const lines: string[] = [`model ${name} {`];
  const props = schema.properties ?? {};
  const req = new Set(schema.required ?? []);

  for (const [key, prop] of Object.entries(props)) {
    const prismaType = jsonSchemaToPrismaType(prop as JsonSchemaDefinition);
    const optional = !req.has(key);
    lines.push(`  ${key} ${prismaType}${optional ? '?' : ''}`);
  }

  lines.push('}');
  return lines.join('\n');
}

function generateEnum(name: string, values: string[]): string {
  const lines: string[] = [`enum ${name} {`];
  for (const v of values) {
    lines.push(`  ${v}`);
  }
  lines.push('}');
  return lines.join('\n');
}

function jsonSchemaToPrismaType(schema: JsonSchemaDefinition): string {
  if (schema.$ref) return schema.$ref.split('/').pop() ?? 'String';

  if (schema.enum) return 'String';

  if (schema.oneOf || schema.anyOf) return 'Json';

  const type = Array.isArray(schema.type) ? schema.type : [schema.type];
  const primary = type.filter(t => t !== 'null')[0] ?? 'String';

  switch (primary) {
    case 'string':
      if (schema.format === 'date-time') return 'DateTime';
      return 'String';
    case 'integer': return 'Int';
    case 'number': return 'Float';
    case 'boolean': return 'Boolean';
    case 'array':
      return schema.items ? `${jsonSchemaToPrismaType(schema.items)}[]` : 'Json';
    case 'object': return 'Json';
    default: return 'String';
  }
}
