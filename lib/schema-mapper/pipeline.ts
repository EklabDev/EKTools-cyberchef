import { SchemaFormat, ConversionResult, ConversionError } from './types';
import { getFormatHandler } from './formats';

export async function convert(
  sourceFormat: SchemaFormat,
  targetFormat: SchemaFormat,
  sourceText: string,
): Promise<ConversionResult | ConversionError> {
  try {
    const sourceHandler = getFormatHandler(sourceFormat);
    const targetHandler = getFormatHandler(targetFormat);

    const jsonSchema = await sourceHandler.parse(sourceText);
    const output = await targetHandler.generate(jsonSchema);

    return { output };
  } catch (e: any) {
    return { error: e.message || 'Conversion failed' };
  }
}
