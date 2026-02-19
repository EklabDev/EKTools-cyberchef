export interface JsonSchemaProperty {
  type?: string | string[];
  description?: string;
  enum?: any[];
  items?: JsonSchemaDefinition;
  properties?: Record<string, JsonSchemaDefinition>;
  required?: string[];
  additionalProperties?: boolean | JsonSchemaDefinition;
  format?: string;
  default?: any;
  oneOf?: JsonSchemaDefinition[];
  anyOf?: JsonSchemaDefinition[];
  allOf?: JsonSchemaDefinition[];
  $ref?: string;
}

export interface JsonSchemaDefinition extends JsonSchemaProperty {
  $schema?: string;
  $id?: string;
  title?: string;
  definitions?: Record<string, JsonSchemaDefinition>;
  $defs?: Record<string, JsonSchemaDefinition>;
}

export type SchemaFormat =
  | 'typescript'
  | 'java-lombok'
  | 'zod'
  | 'prisma'
  | 'go-struct'
  | 'pydantic'
  | 'json-schema';

export const FORMAT_LABELS: Record<SchemaFormat, string> = {
  'typescript': 'TypeScript',
  'java-lombok': 'Java Lombok',
  'zod': 'Zod',
  'prisma': 'Prisma',
  'go-struct': 'Go Struct',
  'pydantic': 'Pydantic',
  'json-schema': 'JSON Schema',
};

export const FORMAT_EXTENSIONS: Record<SchemaFormat, string> = {
  'typescript': '.ts',
  'java-lombok': '.java',
  'zod': '.ts',
  'prisma': '.prisma',
  'go-struct': '.go',
  'pydantic': '.py',
  'json-schema': '.json',
};

export interface FormatHandler {
  parse: (input: string) => Promise<JsonSchemaDefinition>;
  generate: (schema: JsonSchemaDefinition) => Promise<string>;
  validate: (input: string) => { valid: boolean; error?: string };
}

export interface ConversionResult {
  output: string;
  error?: undefined;
}

export interface ConversionError {
  output?: undefined;
  error: string;
}
