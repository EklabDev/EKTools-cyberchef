import { FormatHandler, JsonSchemaDefinition } from '../types';

const STRUCT_REGEX = /type\s+(\w+)\s+struct\s*\{/;

export const goStructHandler: FormatHandler = {
  parse: async (input: string): Promise<JsonSchemaDefinition> => {
    const blocks = extractStructBlocks(input);
    if (blocks.length === 0) throw new Error('No Go struct definitions found');

    if (blocks.length === 1) {
      const schema = parseStructBody(blocks[0].body);
      schema.title = blocks[0].name;
      return schema;
    }

    const definitions: Record<string, JsonSchemaDefinition> = {};
    for (const block of blocks) {
      definitions[block.name] = parseStructBody(block.body);
    }
    return { type: 'object', definitions, properties: {}, title: 'Root' };
  },

  generate: async (schema: JsonSchemaDefinition): Promise<string> => {
    const parts: string[] = [];

    if (schema.definitions || schema.$defs) {
      const defs = schema.definitions ?? schema.$defs ?? {};
      for (const [name, def] of Object.entries(defs)) {
        parts.push(generateStruct(name, def));
      }
      if (schema.properties && Object.keys(schema.properties).length > 0) {
        parts.push(generateStruct(schema.title ?? 'Root', schema));
      }
    } else {
      parts.push(generateStruct(schema.title ?? 'MyStruct', schema));
    }

    return parts.join('\n\n');
  },

  validate: (input: string) => {
    if (!input.trim()) return { valid: false, error: 'Empty input' };
    if (!STRUCT_REGEX.test(input)) {
      return { valid: false, error: 'No Go struct definition found (expected "type Name struct {")' };
    }
    try {
      const blocks = extractStructBlocks(input);
      if (blocks.length === 0) return { valid: false, error: 'Could not parse struct body' };
      return { valid: true };
    } catch (e: any) {
      return { valid: false, error: e.message };
    }
  },
};

function extractStructBlocks(input: string): { name: string; body: string }[] {
  const blocks: { name: string; body: string }[] = [];
  const regex = /type\s+(\w+)\s+struct\s*\{/g;
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

function parseStructBody(body: string): JsonSchemaDefinition {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));

  for (const line of lines) {
    const match = line.match(/^(\w+)\s+(\S+)(?:\s+`.*`)?$/);
    if (!match) continue;
    const [, name, goType] = match;
    const jsonName = extractJsonTag(line) ?? camelCase(name);
    properties[jsonName] = goTypeToJsonSchema(goType);
    required.push(jsonName);
  }

  const schema: JsonSchemaDefinition = { type: 'object', properties };
  if (required.length > 0) schema.required = required;
  return schema;
}

function extractJsonTag(line: string): string | null {
  const tagMatch = line.match(/`json:"([^",]+)/);
  if (tagMatch && tagMatch[1] !== '-') return tagMatch[1];
  return null;
}

function camelCase(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function goTypeToJsonSchema(goType: string): any {
  if (goType.startsWith('[]')) {
    return { type: 'array', items: goTypeToJsonSchema(goType.slice(2)) };
  }
  if (goType.startsWith('*')) {
    const inner = goTypeToJsonSchema(goType.slice(1));
    const t = inner.type ?? 'string';
    return { ...inner, type: [t, 'null'] };
  }
  if (goType.startsWith('map[')) {
    return { type: 'object', additionalProperties: true };
  }
  switch (goType) {
    case 'string': return { type: 'string' };
    case 'int': case 'int8': case 'int16': case 'int32': case 'int64':
    case 'uint': case 'uint8': case 'uint16': case 'uint32': case 'uint64':
      return { type: 'integer' };
    case 'float32': case 'float64': return { type: 'number' };
    case 'bool': return { type: 'boolean' };
    case 'time.Time': return { type: 'string', format: 'date-time' };
    case 'interface{}': case 'any': return {};
    default: return { type: 'string' };
  }
}

function generateStruct(name: string, schema: JsonSchemaDefinition): string {
  const lines: string[] = [`type ${name} struct {`];
  const props = schema.properties ?? {};

  for (const [key, prop] of Object.entries(props)) {
    const goName = pascalCase(key);
    const goType = jsonSchemaToGoType(prop as JsonSchemaDefinition);
    const tag = `\`json:"${key}"\``;
    lines.push(`\t${goName} ${goType} ${tag}`);
  }

  lines.push('}');
  return lines.join('\n');
}

function pascalCase(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function jsonSchemaToGoType(schema: JsonSchemaDefinition): string {
  if (schema.$ref) return schema.$ref.split('/').pop() ?? 'interface{}';
  if (schema.enum) return 'string';

  if (schema.oneOf) return 'interface{}';
  if (schema.anyOf) return 'interface{}';

  const type = Array.isArray(schema.type) ? schema.type : [schema.type];
  const hasNull = type.includes('null');
  const primary = type.filter(t => t !== 'null')[0] ?? 'any';

  let goType: string;
  switch (primary) {
    case 'string':
      goType = schema.format === 'date-time' ? 'time.Time' : 'string';
      break;
    case 'integer': goType = 'int'; break;
    case 'number': goType = 'float64'; break;
    case 'boolean': goType = 'bool'; break;
    case 'array':
      goType = schema.items ? `[]${jsonSchemaToGoType(schema.items)}` : '[]interface{}';
      break;
    case 'object':
      goType = schema.additionalProperties ? 'map[string]interface{}' : 'interface{}';
      break;
    default: goType = 'interface{}';
  }

  return hasNull ? `*${goType}` : goType;
}
