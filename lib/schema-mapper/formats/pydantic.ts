import { FormatHandler, JsonSchemaDefinition } from '../types';

const CLASS_REGEX = /class\s+(\w+)\s*\(\s*BaseModel\s*\)\s*:/;

export const pydanticHandler: FormatHandler = {
  parse: async (input: string): Promise<JsonSchemaDefinition> => {
    const blocks = extractPydanticBlocks(input);
    if (blocks.length === 0) throw new Error('No Pydantic BaseModel classes found');

    if (blocks.length === 1) {
      const schema = parseClassBody(blocks[0].body);
      schema.title = blocks[0].name;
      return schema;
    }

    const definitions: Record<string, JsonSchemaDefinition> = {};
    for (const block of blocks) {
      definitions[block.name] = parseClassBody(block.body);
    }
    return { type: 'object', definitions, properties: {}, title: 'Root' };
  },

  generate: async (schema: JsonSchemaDefinition): Promise<string> => {
    const parts: string[] = ['from pydantic import BaseModel', 'from typing import Optional, List, Any', ''];

    if (schema.definitions || schema.$defs) {
      const defs = schema.definitions ?? schema.$defs ?? {};
      for (const [name, def] of Object.entries(defs)) {
        parts.push(generateClass(name, def));
        parts.push('');
      }
      if (schema.properties && Object.keys(schema.properties).length > 0) {
        parts.push(generateClass(schema.title ?? 'Root', schema));
      }
    } else {
      parts.push(generateClass(schema.title ?? 'MyModel', schema));
    }

    return parts.join('\n').trim();
  },

  validate: (input: string) => {
    if (!input.trim()) return { valid: false, error: 'Empty input' };
    if (!CLASS_REGEX.test(input)) {
      return { valid: false, error: 'No Pydantic BaseModel class found (expected "class Name(BaseModel):")' };
    }
    try {
      const blocks = extractPydanticBlocks(input);
      if (blocks.length === 0) return { valid: false, error: 'Could not parse model body' };
      return { valid: true };
    } catch (e: any) {
      return { valid: false, error: e.message };
    }
  },
};

function extractPydanticBlocks(input: string): { name: string; body: string }[] {
  const blocks: { name: string; body: string }[] = [];
  const lines = input.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^class\s+(\w+)\s*\(\s*BaseModel\s*\)\s*:/);
    if (!match) continue;

    const name = match[1];
    const bodyLines: string[] = [];
    i++;
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '' && bodyLines.length > 0) {
        const nextNonEmpty = lines.slice(i + 1).find(l => l.trim() !== '');
        if (!nextNonEmpty || !nextNonEmpty.startsWith(' ') && !nextNonEmpty.startsWith('\t')) break;
      }
      if (line.trim() !== '' && !line.startsWith(' ') && !line.startsWith('\t')) break;
      bodyLines.push(line);
      i++;
    }
    i--;
    blocks.push({ name, body: bodyLines.join('\n') });
  }

  return blocks;
}

function parseClassBody(body: string): JsonSchemaDefinition {
  const properties: Record<string, any> = {};
  const required: string[] = [];
  const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.startsWith('class '));

  for (const line of lines) {
    if (line.startsWith('def ') || line.startsWith('@')) continue;

    const match = line.match(/^(\w+)\s*:\s*(.+?)(?:\s*=\s*(.+))?$/);
    if (!match) continue;

    const [, name, pyType, defaultVal] = match;
    properties[name] = pyTypeToJsonSchema(pyType.trim());

    const isOptional = pyType.includes('Optional') || defaultVal !== undefined;
    if (!isOptional) required.push(name);
  }

  const schema: JsonSchemaDefinition = { type: 'object', properties };
  if (required.length > 0) schema.required = required;
  return schema;
}

function pyTypeToJsonSchema(pyType: string): any {
  if (pyType.startsWith('Optional[') && pyType.endsWith(']')) {
    const inner = pyTypeToJsonSchema(pyType.slice(9, -1));
    const t = inner.type ?? 'string';
    return { ...inner, type: [t, 'null'] };
  }
  if (pyType.startsWith('List[') && pyType.endsWith(']')) {
    return { type: 'array', items: pyTypeToJsonSchema(pyType.slice(5, -1)) };
  }
  if (pyType.startsWith('list[') && pyType.endsWith(']')) {
    return { type: 'array', items: pyTypeToJsonSchema(pyType.slice(5, -1)) };
  }
  if (pyType.startsWith('Dict[') || pyType.startsWith('dict[')) {
    return { type: 'object', additionalProperties: true };
  }

  switch (pyType) {
    case 'str': return { type: 'string' };
    case 'int': return { type: 'integer' };
    case 'float': return { type: 'number' };
    case 'bool': return { type: 'boolean' };
    case 'Any': case 'any': return {};
    case 'datetime': return { type: 'string', format: 'date-time' };
    case 'date': return { type: 'string', format: 'date' };
    default: return { type: 'string' };
  }
}

function generateClass(name: string, schema: JsonSchemaDefinition): string {
  const lines: string[] = [`class ${name}(BaseModel):`];
  const props = schema.properties ?? {};
  const req = new Set(schema.required ?? []);

  if (Object.keys(props).length === 0) {
    lines.push('    pass');
    return lines.join('\n');
  }

  for (const [key, prop] of Object.entries(props)) {
    const pyType = jsonSchemaToPyType(prop as JsonSchemaDefinition);
    const optional = !req.has(key);
    if (optional) {
      lines.push(`    ${key}: Optional[${pyType}] = None`);
    } else {
      lines.push(`    ${key}: ${pyType}`);
    }
  }

  return lines.join('\n');
}

function jsonSchemaToPyType(schema: JsonSchemaDefinition): string {
  if (schema.$ref) return schema.$ref.split('/').pop() ?? 'Any';
  if (schema.enum) return 'str';

  if (schema.oneOf) return 'Any';
  if (schema.anyOf) return 'Any';

  const type = Array.isArray(schema.type) ? schema.type : [schema.type];
  const hasNull = type.includes('null');
  const primary = type.filter(t => t !== 'null')[0] ?? 'Any';

  let pyType: string;
  switch (primary) {
    case 'string':
      pyType = schema.format === 'date-time' ? 'datetime' : schema.format === 'date' ? 'date' : 'str';
      break;
    case 'integer': pyType = 'int'; break;
    case 'number': pyType = 'float'; break;
    case 'boolean': pyType = 'bool'; break;
    case 'array':
      pyType = schema.items ? `List[${jsonSchemaToPyType(schema.items)}]` : 'List[Any]';
      break;
    case 'object':
      pyType = schema.additionalProperties ? 'Dict[str, Any]' : 'Any';
      break;
    default: pyType = 'Any';
  }

  return hasNull ? `Optional[${pyType}]` : pyType;
}
