import { FormatHandler, JsonSchemaDefinition } from '../types';

const TS_TYPE_REGEX = /(?:export\s+)?(?:interface|type)\s+(\w+)/;

function parseTypeBody(body: string): JsonSchemaDefinition {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  const lines = body.split('\n').map(l => l.trim()).filter(l => l && l !== '{' && l !== '}');

  for (const line of lines) {
    const clean = line.replace(/;$/, '').replace(/,$/, '').trim();
    if (!clean || clean.startsWith('//') || clean.startsWith('/*')) continue;

    const match = clean.match(/^(\w+)(\??)\s*:\s*(.+)$/);
    if (!match) continue;

    const [, name, optional, rawType] = match;
    const tsType = rawType.trim();
    properties[name] = tsTypeToJsonSchema(tsType);
    if (!optional) required.push(name);
  }

  const schema: JsonSchemaDefinition = { type: 'object', properties };
  if (required.length > 0) schema.required = required;
  return schema;
}

function tsTypeToJsonSchema(tsType: string): any {
  const t = tsType.trim();

  if (t.endsWith('[]')) {
    return { type: 'array', items: tsTypeToJsonSchema(t.slice(0, -2)) };
  }
  if (t.startsWith('Array<') && t.endsWith('>')) {
    return { type: 'array', items: tsTypeToJsonSchema(t.slice(6, -1)) };
  }

  if (t.includes(' | ')) {
    const parts = t.split(' | ').map(p => p.trim());
    const hasNull = parts.includes('null');
    const nonNull = parts.filter(p => p !== 'null');
    if (nonNull.length === 1 && hasNull) {
      const inner = tsTypeToJsonSchema(nonNull[0]);
      return { ...inner, type: [inner.type ?? 'string', 'null'] };
    }
    return { oneOf: parts.map(p => tsTypeToJsonSchema(p)) };
  }

  if (t.startsWith('{') && t.endsWith('}')) {
    return parseInlineObject(t);
  }

  if (t.startsWith("'") || t.startsWith('"')) {
    return { type: 'string', enum: [t.slice(1, -1)] };
  }

  switch (t) {
    case 'string': return { type: 'string' };
    case 'number': return { type: 'number' };
    case 'boolean': return { type: 'boolean' };
    case 'null': return { type: 'null' };
    case 'any': return {};
    case 'unknown': return {};
    case 'Date': return { type: 'string', format: 'date-time' };
    case 'Record<string, any>':
    case 'object':
      return { type: 'object', additionalProperties: true };
    default: return { type: 'string' };
  }
}

function parseInlineObject(t: string): any {
  const inner = t.slice(1, -1).trim();
  return parseTypeBody(inner);
}

export const typescriptHandler: FormatHandler = {
  parse: async (input: string): Promise<JsonSchemaDefinition> => {
    const blocks = extractTypeBlocks(input);
    if (blocks.length === 0) {
      throw new Error('No TypeScript interface or type definitions found');
    }
    if (blocks.length === 1) {
      const schema = parseTypeBody(blocks[0].body);
      schema.title = blocks[0].name;
      return schema;
    }
    const definitions: Record<string, JsonSchemaDefinition> = {};
    for (const block of blocks) {
      definitions[block.name] = parseTypeBody(block.body);
    }
    return {
      type: 'object',
      definitions,
      properties: {},
      title: 'Root',
    };
  },

  generate: async (schema: JsonSchemaDefinition): Promise<string> => {
    const lines: string[] = [];

    if (schema.definitions || schema.$defs) {
      const defs = schema.definitions ?? schema.$defs ?? {};
      for (const [name, def] of Object.entries(defs)) {
        lines.push(generateInterface(name, def));
        lines.push('');
      }
      if (schema.properties && Object.keys(schema.properties).length > 0) {
        lines.push(generateInterface(schema.title ?? 'Root', schema));
      }
    } else {
      lines.push(generateInterface(schema.title ?? 'MyType', schema));
    }

    return lines.join('\n').trim();
  },

  validate: (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return { valid: false, error: 'Empty input' };
    if (!TS_TYPE_REGEX.test(trimmed)) {
      return { valid: false, error: 'No TypeScript interface or type declaration found' };
    }
    try {
      const blocks = extractTypeBlocks(trimmed);
      if (blocks.length === 0) {
        return { valid: false, error: 'Could not parse any type definitions' };
      }
      return { valid: true };
    } catch (e: any) {
      return { valid: false, error: e.message };
    }
  },
};

function extractTypeBlocks(input: string): { name: string; body: string }[] {
  const blocks: { name: string; body: string }[] = [];
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+\w+(?:\s*,\s*\w+)*)?\s*\{/g;
  const typeRegex = /(?:export\s+)?type\s+(\w+)\s*=\s*\{/g;

  for (const regex of [interfaceRegex, typeRegex]) {
    let match;
    while ((match = regex.exec(input)) !== null) {
      const name = match[1];
      const startIdx = match.index + match[0].length;
      const body = extractBracedBody(input, startIdx);
      if (body !== null) {
        blocks.push({ name, body });
      }
    }
  }
  return blocks;
}

function extractBracedBody(input: string, startIdx: number): string | null {
  let depth = 1;
  let i = startIdx;
  while (i < input.length && depth > 0) {
    if (input[i] === '{') depth++;
    else if (input[i] === '}') depth--;
    i++;
  }
  if (depth !== 0) return null;
  return input.slice(startIdx, i - 1);
}

function generateInterface(name: string, schema: JsonSchemaDefinition): string {
  const lines: string[] = [`export interface ${name} {`];
  const props = schema.properties ?? {};
  const req = new Set(schema.required ?? []);

  for (const [key, prop] of Object.entries(props)) {
    const optional = !req.has(key);
    const tsType = jsonSchemaToTsType(prop as JsonSchemaDefinition);
    lines.push(`  ${key}${optional ? '?' : ''}: ${tsType};`);
  }

  lines.push('}');
  return lines.join('\n');
}

function jsonSchemaToTsType(schema: JsonSchemaDefinition): string {
  if (schema.$ref) return schema.$ref.split('/').pop() ?? 'unknown';

  if (schema.enum) {
    return schema.enum.map(v => typeof v === 'string' ? `'${v}'` : String(v)).join(' | ');
  }

  if (schema.oneOf) return schema.oneOf.map(s => jsonSchemaToTsType(s)).join(' | ');
  if (schema.anyOf) return schema.anyOf.map(s => jsonSchemaToTsType(s)).join(' | ');

  const type = Array.isArray(schema.type) ? schema.type : [schema.type];
  const hasNull = type.includes('null');
  const nonNull = type.filter(t => t !== 'null');
  const primary = nonNull[0] ?? 'any';

  let tsType: string;
  switch (primary) {
    case 'string':
      tsType = schema.format === 'date-time' ? 'Date' : 'string';
      break;
    case 'number':
    case 'integer':
      tsType = 'number';
      break;
    case 'boolean':
      tsType = 'boolean';
      break;
    case 'array':
      tsType = schema.items ? `${jsonSchemaToTsType(schema.items)}[]` : 'any[]';
      break;
    case 'object':
      if (schema.properties) {
        const props = Object.entries(schema.properties).map(([k, v]) => {
          const opt = !schema.required?.includes(k);
          return `${k}${opt ? '?' : ''}: ${jsonSchemaToTsType(v as JsonSchemaDefinition)}`;
        });
        tsType = `{ ${props.join('; ')} }`;
      } else if (schema.additionalProperties) {
        tsType = 'Record<string, any>';
      } else {
        tsType = 'object';
      }
      break;
    default:
      tsType = 'any';
  }

  return hasNull ? `${tsType} | null` : tsType;
}
