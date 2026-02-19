import { SchemaFormat, FormatHandler } from '../types';
import { jsonSchemaHandler } from './json-schema';
import { zodHandler } from './zod';
import { typescriptHandler } from './typescript';
import { goStructHandler } from './go-struct';
import { pydanticHandler } from './pydantic';
import { javaLombokHandler } from './java-lombok';
import { prismaHandler } from './prisma';

const handlers: Record<SchemaFormat, FormatHandler> = {
  'json-schema': jsonSchemaHandler,
  'zod': zodHandler,
  'typescript': typescriptHandler,
  'go-struct': goStructHandler,
  'pydantic': pydanticHandler,
  'java-lombok': javaLombokHandler,
  'prisma': prismaHandler,
};

export function getFormatHandler(format: SchemaFormat): FormatHandler {
  const handler = handlers[format];
  if (!handler) {
    throw new Error(`Unsupported format: ${format}`);
  }
  return handler;
}

export function validateInput(format: SchemaFormat, input: string) {
  return getFormatHandler(format).validate(input);
}
