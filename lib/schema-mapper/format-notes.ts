import { SchemaFormat } from './types';

export const FORMAT_NOTES: Record<SchemaFormat, string> = {
  'json-schema': 'Full JSON Schema support. Used as the canonical intermediate for all conversions.',
  'typescript': 'Supports interfaces and type aliases with basic types, arrays, optional fields, and union types. Generics and mapped types are not supported.',
  'zod': 'Input must be a Zod expression (e.g. z.object(...)). Uses Zod v4 semantics. Complex transforms and refinements may not round-trip.',
  'go-struct': 'Supports struct field types, pointers (*T → nullable), slices ([]T → array), and json tags. Nested struct definitions are not parsed.',
  'pydantic': 'Supports BaseModel classes with type annotations. Optional[], List[], Dict[] recognized. Complex validators are ignored.',
  'java-lombok': 'Supports @Data annotated classes. Recognizes Java primitives, boxed types, List<T>, Set<T>, Map<K,V>, and date types.',
  'prisma': 'Supports model and enum blocks only. datasource, generator, and other blocks are ignored. Relations (@relation) are treated as string fields.',
};
