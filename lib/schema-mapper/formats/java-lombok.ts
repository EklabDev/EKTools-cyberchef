import { FormatHandler, JsonSchemaDefinition } from '../types';

const CLASS_REGEX = /@Data[\s\S]*?class\s+(\w+)/;

export const javaLombokHandler: FormatHandler = {
  parse: async (input: string): Promise<JsonSchemaDefinition> => {
    const blocks = extractClassBlocks(input);
    if (blocks.length === 0) throw new Error('No Java Lombok @Data classes found');

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
    const parts: string[] = [
      'import lombok.Data;',
      '',
    ];

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
      parts.push(generateClass(schema.title ?? 'MyClass', schema));
    }

    return parts.join('\n').trim();
  },

  validate: (input: string) => {
    if (!input.trim()) return { valid: false, error: 'Empty input' };
    if (!CLASS_REGEX.test(input)) {
      return { valid: false, error: 'No @Data class found (expected @Data annotation before class declaration)' };
    }
    try {
      const blocks = extractClassBlocks(input);
      if (blocks.length === 0) return { valid: false, error: 'Could not parse class body' };
      return { valid: true };
    } catch (e: any) {
      return { valid: false, error: e.message };
    }
  },
};

function extractClassBlocks(input: string): { name: string; body: string }[] {
  const blocks: { name: string; body: string }[] = [];
  const regex = /@Data[\s\S]*?(?:public\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*\{/g;
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

function parseClassBody(body: string): JsonSchemaDefinition {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('/*') && !l.startsWith('*'));

  for (const line of lines) {
    const clean = line.replace(/;$/, '').trim();
    if (!clean || clean.startsWith('@') || clean.startsWith('public ') && clean.includes('(')) continue;

    const match = clean.match(/(?:private|protected|public)?\s*(\S+)\s+(\w+)$/);
    if (!match) continue;

    const [, javaType, name] = match;
    properties[name] = javaTypeToJsonSchema(javaType);
    required.push(name);
  }

  const schema: JsonSchemaDefinition = { type: 'object', properties };
  if (required.length > 0) schema.required = required;
  return schema;
}

function javaTypeToJsonSchema(javaType: string): any {
  if (javaType.startsWith('List<') && javaType.endsWith('>')) {
    return { type: 'array', items: javaTypeToJsonSchema(javaType.slice(5, -1)) };
  }
  if (javaType.startsWith('Set<') && javaType.endsWith('>')) {
    return { type: 'array', items: javaTypeToJsonSchema(javaType.slice(4, -1)) };
  }
  if (javaType.startsWith('Map<')) {
    return { type: 'object', additionalProperties: true };
  }

  switch (javaType) {
    case 'String': return { type: 'string' };
    case 'int': case 'Integer': case 'long': case 'Long':
    case 'short': case 'Short': case 'byte': case 'Byte':
      return { type: 'integer' };
    case 'float': case 'Float': case 'double': case 'Double':
    case 'BigDecimal':
      return { type: 'number' };
    case 'boolean': case 'Boolean': return { type: 'boolean' };
    case 'Date': case 'LocalDateTime': case 'ZonedDateTime': case 'Instant':
      return { type: 'string', format: 'date-time' };
    case 'LocalDate': return { type: 'string', format: 'date' };
    case 'Object': return {};
    default: return { type: 'string' };
  }
}

function generateClass(name: string, schema: JsonSchemaDefinition): string {
  const lines: string[] = ['@Data', `public class ${name} {`];
  const props = schema.properties ?? {};

  for (const [key, prop] of Object.entries(props)) {
    const javaType = jsonSchemaToJavaType(prop as JsonSchemaDefinition);
    lines.push(`    private ${javaType} ${key};`);
  }

  lines.push('}');
  return lines.join('\n');
}

function jsonSchemaToJavaType(schema: JsonSchemaDefinition): string {
  if (schema.$ref) return schema.$ref.split('/').pop() ?? 'Object';
  if (schema.enum) return 'String';

  if (schema.oneOf || schema.anyOf) return 'Object';

  const type = Array.isArray(schema.type) ? schema.type : [schema.type];
  const primary = type.filter(t => t !== 'null')[0] ?? 'Object';

  switch (primary) {
    case 'string':
      if (schema.format === 'date-time') return 'LocalDateTime';
      if (schema.format === 'date') return 'LocalDate';
      return 'String';
    case 'integer': return 'Long';
    case 'number': return 'Double';
    case 'boolean': return 'Boolean';
    case 'array':
      return schema.items ? `List<${jsonSchemaToJavaType(schema.items)}>` : 'List<Object>';
    case 'object':
      return schema.additionalProperties ? 'Map<String, Object>' : 'Object';
    default: return 'Object';
  }
}
