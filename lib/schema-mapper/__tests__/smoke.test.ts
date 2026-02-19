import { convert } from '../pipeline';
import { validateInput } from '../formats';
import { SchemaFormat } from '../types';

const ALL_FORMATS: SchemaFormat[] = [
  'json-schema',
  'typescript',
  'zod',
  'go-struct',
  'pydantic',
  'java-lombok',
  'prisma',
];

const SAMPLE_INPUTS: Record<SchemaFormat, string> = {
  'json-schema': JSON.stringify({
    type: 'object',
    title: 'User',
    properties: {
      name: { type: 'string' },
      age: { type: 'integer' },
      active: { type: 'boolean' },
      tags: { type: 'array', items: { type: 'string' } },
    },
    required: ['name', 'age'],
  }, null, 2),

  'typescript': `export interface User {
  name: string;
  age: number;
  active?: boolean;
  tags?: string[];
}`,

  'zod': `z.object({
  name: z.string(),
  age: z.number(),
  active: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})`,

  'go-struct': `type User struct {
\tName   string   \`json:"name"\`
\tAge    int      \`json:"age"\`
\tActive bool     \`json:"active"\`
\tTags   []string \`json:"tags"\`
}`,

  'pydantic': `class User(BaseModel):
    name: str
    age: int
    active: Optional[bool] = None
    tags: Optional[List[str]] = None`,

  'java-lombok': `@Data
public class User {
    private String name;
    private Long age;
    private Boolean active;
    private List<String> tags;
}`,

  'prisma': `model User {
  name   String
  age    Int
  active Boolean?
  tags   String[]
}`,
};

describe('Schema Mapper smoke tests', () => {
  describe('validation', () => {
    for (const format of ALL_FORMATS) {
      it(`validates ${format} sample input`, () => {
        const result = validateInput(format, SAMPLE_INPUTS[format]);
        expect(result.valid).toBe(true);
      });
    }
  });

  describe('all format pair conversions', () => {
    for (const source of ALL_FORMATS) {
      for (const target of ALL_FORMATS) {
        it(`converts ${source} → ${target}`, async () => {
          const result = await convert(source, target, SAMPLE_INPUTS[source]);
          expect(result.error).toBeUndefined();
          expect(result.output).toBeTruthy();
          expect(typeof result.output).toBe('string');
          expect(result.output!.length).toBeGreaterThan(0);
        });
      }
    }
  });

  describe('validation rejects invalid input', () => {
    for (const format of ALL_FORMATS) {
      it(`rejects garbage for ${format}`, () => {
        const result = validateInput(format, 'this is not valid input!@#$%');
        expect(result.valid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    }
  });

  describe('json-schema round-trip', () => {
    it('parses and regenerates JSON Schema (identity)', async () => {
      const input = SAMPLE_INPUTS['json-schema'];
      const result = await convert('json-schema', 'json-schema', input);
      expect(result.error).toBeUndefined();
      const parsed = JSON.parse(result.output!);
      expect(parsed.properties.name.type).toBe('string');
      expect(parsed.properties.age.type).toBe('integer');
    });
  });
});
